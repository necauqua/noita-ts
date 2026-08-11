// Assemble an x86 patch .asm into { asm, vars, labels }.
//
// Runs this package's nasm binary with `%use masm` and reloc.asm pre-included,
// then parses the resulting ELF32 object:
//   - asm    : the raw .text machine code as a byte array, with every reloc's
//              magic dword zeroed out (the caller injects the real 32-bit value
//              at runtime).
//   - vars   : reloc name -> list of byte offsets in `asm` where its 32-bit
//              field lives (declared via `reloc <name>` in reloc.asm).
//   - labels : every other .text symbol (label) -> its byte offset in `asm`.
//
// A `reloc <name>` assembles to the magic dword 0xD1BE7700 + index and exports
// an absolute symbol `__reloc_<name>` = index. We scan .text for those dwords,
// record their offsets per name, and zero them.
//
// Absolute references to the patch's own labels (`mulss xmm0, [float_16]`) leave
// real R_386_32 relocations in .rel.text. Those are folded into an implicit
// `BASE` reloc: the site keeps the label's offset within the patch as an addend,
// and its offset is recorded under `BASE`, so linking with the patch's runtime
// address turns each field into `BASE + offset`. Anything the assembler cannot
// resolve this way (an extern, a symbol outside .text, a relocation type other
// than R_386_32) is still a hard error: the patch must be self-contained.

import { execFileSync } from 'node:child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { nasmPath } from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RELOC = resolve(HERE, 'reloc.asm');
const RELOC_MAGIC_BASE = 0xd1be7700;

// ELF constants
const SHT_PROGBITS = 1;
const SHT_SYMTAB = 2;
const SHT_RELA = 4;
const SHT_REL = 9;
const STT_SECTION = 3;
const R_386_32 = 1;

/** Implicit reloc holding the patch's runtime base address. */
const BASE = 'BASE';

/**
 * Rewrite nasm's `<file>:<line>: error: ...` prefixes so they point at where the
 * source really came from: `label` instead of the (possibly temporary) file nasm
 * was handed, and the line shifted by `lineOffset` (for sources embedded in a
 * larger file, such as an inline `asm` template in a .ts).
 */
function remapDiagnostics(stderr, input, label, lineOffset) {
  return stderr
    .split('\n')
    .map((line) => {
      const m = /^(.*?):(\d+):/.exec(line);
      if (!m || m[1] !== input) return line;
      const mapped = `${label}:${Number(m[2]) + lineOffset}:`;
      return mapped + line.slice(m[0].length);
    })
    .join('\n');
}

function runNasm(input, label = input, lineOffset = 0) {
  const out = resolve(tmpdir(), `noita-asm-${process.pid}-${Date.now()}.o`);
  try {
    try {
      execFileSync(nasmPath, [
        '--before', '%use masm',
        '--before', `%include "${RELOC}"`,
        '--bits', '32',
        '-f', 'elf32',
        input,
        '-o', out,
      ], { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err) {
      // Surface just nasm's diagnostics, not the full command line / node stack.
      const stderr = (err.stderr?.toString() ?? '').trim();
      const message = stderr
        ? remapDiagnostics(stderr, input, label, lineOffset)
        : err.message;
      const error = new Error(`nasm failed to assemble ${label}:\n${message}`);
      // nasm's own output, without the wrapper line, for callers that already
      // report which source failed (the plugin's per-node diagnostics).
      error.nasmOutput = message;
      throw error;
    }
    return readFileSync(out);
  } finally {
    try {
      unlinkSync(out);
    } catch {
      // never created
    }
  }
}

// --- minimal ELF32 (little-endian) reader --------------------------------
function parseElf(buf) {
  if (buf.readUInt32LE(0) !== 0x464c457f) throw new Error('not an ELF file');
  if (buf[4] !== 1) throw new Error('expected ELF32');
  const shoff = buf.readUInt32LE(32);
  const shentsize = buf.readUInt16LE(46);
  const shnum = buf.readUInt16LE(48);
  const shstrndx = buf.readUInt16LE(50);

  const secs = [];
  for (let i = 0; i < shnum; i++) {
    const o = shoff + i * shentsize;
    secs.push({
      nameOff: buf.readUInt32LE(o + 0),
      type: buf.readUInt32LE(o + 4),
      offset: buf.readUInt32LE(o + 16),
      size: buf.readUInt32LE(o + 20),
      link: buf.readUInt32LE(o + 24),
      info: buf.readUInt32LE(o + 28),
      entsize: buf.readUInt32LE(o + 36),
    });
  }

  const cstr = (base, off) => {
    let end = base + off;
    while (buf[end] !== 0) end++;
    return buf.toString('latin1', base + off, end);
  };
  const shstr = secs[shstrndx];
  for (const s of secs) s.name = cstr(shstr.offset, s.nameOff);

  const textIndex = secs.findIndex(
    (s) => s.name === '.text' && s.type === SHT_PROGBITS,
  );
  if (textIndex < 0) throw new Error('no .text section found');
  const text = secs[textIndex];

  const symtab = secs.find((s) => s.type === SHT_SYMTAB);
  if (!symtab) throw new Error('no symbol table found');
  const strtab = secs[symtab.link];

  const relocIndexToName = new Map();
  const labels = {};
  const syms = [];
  for (let o = symtab.offset; o < symtab.offset + symtab.size; o += symtab.entsize) {
    const name = cstr(strtab.offset, buf.readUInt32LE(o + 0));
    const value = buf.readUInt32LE(o + 4);
    const info = buf[o + 12];
    const shndx = buf.readUInt16LE(o + 14);
    syms.push({ name, value, shndx, type: info & 0xf });
    if (name.startsWith('__reloc_')) {
      relocIndexToName.set(value, name.slice('__reloc_'.length));
    } else if (
      name &&
      !name.includes('.') && // skip nasm sublabels (parent.child); only toplevel
      shndx === textIndex &&
      (info & 0xf) !== STT_SECTION
    ) {
      labels[name] = value;
    }
  }

  // Relocations against .text: each must be an absolute reference to something
  // defined inside this very patch, so it can be expressed as `BASE + addend`.
  const rels = [];
  for (const s of secs) {
    if (s.type === SHT_RELA && s.info === textIndex && s.size > 0) {
      throw new Error(`unsupported RELA relocations in ${s.name}`);
    }
    if (s.type !== SHT_REL || s.info !== textIndex) continue;
    for (let o = s.offset; o < s.offset + s.size; o += s.entsize) {
      const offset = buf.readUInt32LE(o + 0);
      const info = buf.readUInt32LE(o + 4);
      const sym = syms[info >>> 8] ?? { name: '?', value: 0, shndx: 0 };
      const type = info & 0xff;
      const what = sym.type === STT_SECTION ? `section ${sym.name}` : `'${sym.name}'`;
      if (type !== R_386_32) {
        throw new Error(
          `patch has an unsupported relocation (type ${type}) against ${what}; ` +
            `x86 patches may only reference their own labels absolutely`,
        );
      }
      if (sym.shndx !== textIndex) {
        throw new Error(
          `patch references ${what}, which is not defined in its own .text; ` +
            `x86 patches must not reference externs or other sections`,
        );
      }
      rels.push({ offset, addend: sym.value });
    }
  }

  return {
    text: buf.subarray(text.offset, text.offset + text.size),
    relocIndexToName,
    labels,
    rels,
  };
}

// --- scan for magic dwords, record offsets, zero them out ----------------
function extract({ text, relocIndexToName, labels, rels }) {
  const asm = Buffer.from(text); // mutable copy
  const vars = {};
  for (let i = 0; i + 4 <= asm.length; i++) {
    const dword = asm.readUInt32LE(i);
    if (((dword & 0xffffff00) >>> 0) !== RELOC_MAGIC_BASE) continue;
    const name = relocIndexToName.get(dword - RELOC_MAGIC_BASE);
    if (name === undefined) continue;
    (vars[name] ??= []).push(i);
    asm.writeUInt32LE(0, i); // zero the placeholder
  }
  // Fold R_386_32 sites into `BASE`: bake the symbol's offset into the field as
  // an addend, so linking only has to add the patch's runtime address to it.
  for (const { offset, addend } of rels) {
    asm.writeUInt32LE((asm.readUInt32LE(offset) + addend) >>> 0, offset);
    (vars[BASE] ??= []).push(offset);
  }
  return { asm: [...asm], vars, labels };
}

/** Assemble `inputPath` (absolute or cwd-relative) into { asm, vars, labels }. */
export function assemble(inputPath) {
  return extract(parseElf(runNasm(resolve(inputPath))));
}

let inlineCounter = 0;

/**
 * Assemble assembly held in memory into { asm, vars, labels }.
 *
 * nasm only reads files, so the source is staged in a temp file and removed
 * again; `label` and `lineOffset` describe where it actually lives, so error
 * messages point back at the real source (e.g. `src/init.ts:42: error: ...`)
 * rather than at the temp file.
 */
export function assembleSource(source, { label = '<inline asm>', lineOffset = 0 } = {}) {
  const input = resolve(
    tmpdir(),
    `noita-asm-${process.pid}-${Date.now()}-${inlineCounter++}.asm`,
  );
  writeFileSync(input, source);
  try {
    return extract(parseElf(runNasm(input, label, lineOffset)));
  } finally {
    try {
      unlinkSync(input);
    } catch {
      // already gone
    }
  }
}

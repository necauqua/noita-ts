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
// The object must be fully self-contained: if nasm emitted any real relocations
// against .text (e.g. an absolute reference to a label or an undefined extern),
// assembly throws, since such a field cannot be resolved at patch time.

import { execFileSync } from 'node:child_process';
import { readFileSync, unlinkSync } from 'node:fs';
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

function runNasm(input) {
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
      throw new Error(`nasm failed to assemble ${input}:\n${stderr || err.message}`);
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

  // Reject any real relocations against .text -- the patch must be self-contained.
  for (const s of secs) {
    if ((s.type === SHT_REL || s.type === SHT_RELA) && s.info === textIndex && s.size > 0) {
      throw new Error(
        `patch has ${s.size / (s.entsize || 1)} unresolved relocation(s) in ` +
          `${s.name}; x86 patches must not reference absolute addresses or externs`,
      );
    }
  }

  const symtab = secs.find((s) => s.type === SHT_SYMTAB);
  if (!symtab) throw new Error('no symbol table found');
  const strtab = secs[symtab.link];

  const relocIndexToName = new Map();
  const labels = {};
  for (let o = symtab.offset; o < symtab.offset + symtab.size; o += symtab.entsize) {
    const name = cstr(strtab.offset, buf.readUInt32LE(o + 0));
    const value = buf.readUInt32LE(o + 4);
    const info = buf[o + 12];
    const shndx = buf.readUInt16LE(o + 14);
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

  return {
    text: buf.subarray(text.offset, text.offset + text.size),
    relocIndexToName,
    labels,
  };
}

// --- scan for magic dwords, record offsets, zero them out ----------------
function extract({ text, relocIndexToName, labels }) {
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
  return { asm: [...asm], vars, labels };
}

/** Assemble `inputPath` (absolute or cwd-relative) into { asm, vars, labels }. */
export function assemble(inputPath) {
  return extract(parseElf(runNasm(resolve(inputPath))));
}

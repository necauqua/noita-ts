# x86 patch assembly (inline `asm()` → callable `{ raw, vars, labels }`)

Assembles small x86 machine-code patches (for runtime code injection) from NASM
sources, with runtime-injected 32-bit fields.

## Relocs

`reloc.asm` provides a `reloc` macro, used like `equ` — a label followed by it.
Each `<name>: reloc` declares a 32-bit field that assembles to the magic dword `0xD1BE7700 + index`; the assembler scans for
those dwords, records their byte offsets, and **zeroes them out** so the caller
injects the real value at runtime.

```asm
c075: reloc
c5:   reloc
main:
    mulss xmm0, dword ptr[c075]   ; runtime-injected dword
```

`%use masm` (MASM syntax) and `reloc.asm` are pre-included via `--before`, so
sources need neither.

### `BASE` and the patch's own labels

A patch may also reference its own labels absolutely (constant pools, jump
tables, scratch storage):

```asm
float_16: dd 16.0

entry:
    mulss xmm0, [float_16]
```

Those leave real `R_386_32` relocations, which the assembler folds into an
implicit `BASE` reloc: the field keeps the label's offset within the patch as an
addend, and its site is recorded under `BASE`, so linking computes
`BASE + offset`. No `BASE: reloc` declaration is needed (declaring one anyway just
makes the name usable in code, e.g. `mov eax, BASE`).

Anything that cannot be resolved this way — an extern, a symbol outside `.text`,
or a relocation type other than `R_386_32` — is still a hard error: a patch must
be self-contained.

### `entry`

If a patch defines an `entry` label, `ffi.cave` hooks to `cave + entry` instead
of the start of the cave, so data can be laid out in front of the code without a
jump over it.

## Output

Assembling produces a callable `{ raw, vars, labels }`:

- `raw`    – raw patch bytes (reloc fields zeroed)
- `vars`   – reloc name → byte offsets of its 32-bit field(s) in `raw`
- `labels` – every other `.text` label → its byte offset in `raw`

Calling the patch **links** it: it returns a fresh copy of `raw` with each
reloc's value added little-endian into every offset recorded for it in `vars`
(plain reloc fields are zeroed in `raw`, so that is just a write; `BASE` fields
hold their addend). `raw` itself is never mutated, so one patch can be linked
repeatedly with different values.

```ts
ffi.cave(addr, patch({ c075: someAddr, c5: 0x3f800000 }));
```

Every reloc must be given a value; a missing one is an error. For a patch with
no relocs the argument is optional, so `patch()` just yields a copy of `raw`.

`BASE` is the exception: a patch's runtime address isn't known until it's placed,
so omitting it returns a **function** taking that address and yielding the linked
bytes. `ffi.cave` accepts such a function directly — it allocates the cave first,
then calls it with the cave's address:

```ts
ffi.cave(addr, patch({ c075: someAddr })); // BASE supplied by cave
```

## Usage

Install the assembler:

```sh
npm i -D @noita-ts/nasm
```

Wire the plugin in `tsconfig.json`:

```jsonc
{
  "tstl": { "luaPlugins": [{ "name": "@noita-ts/nasm/asm-plugin" }] }
}
```

then write patches inline, with the global `asm()`:

```ts
const thumbWidth = asm(`
cell_width: reloc
width:      reloc

entry:
    cmp   dword [esi+0x7c], __float32__(12.0)
    jae   .preview
    movss xmm7, [cell_width]
    movss [width], xmm7
    jmp   .done
.preview:
    mov   dword [width], __float32__(16.0)
.done:
`);

ffi.cave(addr, thumbWidth({ cell_width, width }));
```

The plugin's call visitor assembles the block at build time and replaces the
whole call with the patch table right where it stands, so there is no module and
nothing to import (`asm` is an ambient declaration, so it emits no `require` of
its own). Nothing is written to the source tree or to disk. Identical blocks are
assembled once and cached.

The linking runtime is **not** inlined into each patch: it is emitted once as a
single `asm_link.lua` at the root of the output, and every patch just `require`s
it. So a patch is only its own bytes, offsets and labels, regardless of how many
patches a mod has.

The string must be **constant**: `${...}` substitutions are rejected, both by the
type of `asm` and by the plugin. Values reach the patch through relocs, which is
the point of them.

nasm errors are reported as normal TypeScript diagnostics pointing at the block,
with nasm's line numbers mapped onto the `.ts` file:

```
src/init.ts:66:13 - error TS0: src/init.ts:68: error: symbol `notathing' not defined
```

### Types

A block has no module to hang generated declarations off, so its reloc and label
names are parsed **out of the source text at the type level**, by the `asm`
namespace in `asm.d.ts`. Reference the types once, anywhere in your sources:

```ts
/// <reference types="@noita-ts/nasm/asm" />
```

and the names follow from the block itself:

```ts
const p = asm(`
cell_width: reloc
width:      reloc
val: dd 16.0
entry:
    movss xmm7, [cell_width]
.done:
`);

p.labels.entry;                       // ok: 'val' | 'entry'
p.labels.done;                        // error: `.done` is a sublabel
p({ cell_width: 1 });                 // error: 'width' is missing
p({ cell_width: 1, width: 2 });       // ok
```

The parser splits the string into lines, drops `;` comments, and takes `name:
reloc` declarations and `name:` definitions — the same things `assemble.mjs` reads
out of the object file, including its skipping of nasm sublabels (`.foo`).

This is also why the block is an **argument** rather than a tagged template
(`` asm`...` ``): TypeScript only gives a template literal a literal type when it
is passed as a normal argument to a `const` type parameter; a tag's strings array
is always the opaque `TemplateStringsArray`, which carries no text to parse.

One thing the types cannot see is `BASE`, which is implied by *how* operands are
used rather than declared, so it is always accepted as an optional extra value.
It does still decide the result type, since only a *missing* `BASE` defers
linking:

```ts
const bytes: number[] = p({ cell_width: 1, width: 2, BASE: addr }); // pinned
const either = p({ cell_width: 1, width: 2 }); // number[] | ((base) => number[])
```

The deferring case keeps the union because whether the patch needs a `BASE` at
all is invisible here; `ffi.cave` takes either, and supplies the cave address.

Parsing a block costs type instantiations — a ~15-line patch is around 30k, which
is unnoticeable, but they do add up, so keep patches to the small pieces of code
they are meant to be.

## nasm binary

The real binaries live in per-platform packages (`@noita-ts/nasm-<os>-<cpu>`)
declared here as `os`/`cpu`-gated optional dependencies, so npm fetches only the
~460KB binary for the current machine and skips the others. Installing this
package is what opts you into that download — mods that never assemble patches
don't depend on it at all.

# x86 patch assembly (`.asm` → callable `{ raw, vars, labels }`)

Assembles small x86 machine-code patches (for runtime code injection) from NASM
sources, with runtime-injected 32-bit fields.

## Relocs

`reloc.asm` provides a `reloc` macro. Each `reloc <name>` declares a 32-bit field
that assembles to the magic dword `0xD1BE7700 + index`; the assembler scans for
those dwords, records their byte offsets, and **zeroes them out** so the caller
injects the real value at runtime.

```asm
reloc c075, c5
main:
    mulss xmm0, dword ptr[c075]   ; runtime-injected dword
```

`%use masm` (MASM syntax) and `reloc.asm` are pre-included via `--before`, so
sources need neither.

## Output

Assembling produces a callable `{ raw, vars, labels }`:

- `raw`    – raw patch bytes (reloc fields zeroed)
- `vars`   – reloc name → byte offsets of its 32-bit field(s) in `raw`
- `labels` – every other `.text` label → its byte offset in `raw`

Calling the patch **links** it: it returns a fresh copy of `raw` with each
reloc's value written little-endian at every offset recorded for it in `vars`.
`raw` itself is never mutated, so one patch can be linked repeatedly with
different values.

```ts
import patch from './patches/my_patch.asm';

ffi.cave(addr, patch({ c075: someAddr, c5: 0x3f800000 }));
```

Every reloc must be given a value; a missing one is an error. For a patch with
no relocs the argument is optional, so `patch()` just yields a copy of `raw`.

Assembly fails if the object contains any real relocations against `.text`
(absolute label refs or externs), since such a patch is not self-contained.

## Usage

Install the assembler (it's an optional peer of `@noita-ts/ffi`, so it isn't
downloaded unless you actually assemble patches):

```sh
npm i -D @noita-ts/nasm
```

Import `.asm` files directly. Wire the plugin in `tsconfig.json`:

```jsonc
{
  "tstl": { "luaPlugins": [{ "name": "@noita-ts/nasm/asm-plugin" }] }
}
```

then:

```ts
import patch from './patches/my_patch.asm';
// patch({ <reloc>: value, ... }), patch.raw, patch.vars.<reloc>, patch.labels.<label>
```

The plugin assembles on resolve and serves the generated module entirely from
memory (nothing is written to the source tree or to disk); TSTL emits it into the
build output mirroring the source layout (`patches/my_patch.asm` → `patches/my_patch_asm.lua`)
and rewrites the require to it.

The linking runtime is **not** inlined into each patch: it is emitted once as a
single `asm_link.lua` at the root of the output, and every generated patch just
`require`s it. So a patch module is only its own bytes, offsets and labels,
regardless of how many patches a mod has.

#### Types

The `.asm` ambient types ship in this package as `@noita-ts/nasm/asm`. Reference
them once, anywhere in your sources:

```ts
/// <reference types="@noita-ts/nasm/asm" />
```

- **Before the first build** the shipped file is a generic fallback
  (`vars`/`labels` typed as `Record<...>`), so `.asm` imports type-check
  immediately after install — no postinstall, no extra package.
- **Each `nts build`** the asm-plugin rewrites its own `asm.d.ts` in the
  installed `node_modules/@noita-ts/nasm`, prepending a **concrete block per
  imported `.asm`** (exact `vars`/`labels` keys) before the generic `*.asm`
  fallback so it wins the wildcard match — types sharpen automatically after the
  first build. The plugin only ever writes files inside its own package.

> The plugin only rewrites a real installed copy: when `@noita-ts/nasm` is
> symlinked (workspaces, `npm link`), the file belongs to a shared source
> checkout, so it's left alone and the generic fallback stays in effect.

## nasm binary

The real binaries live in per-platform packages (`@noita-ts/nasm-<os>-<cpu>`)
declared here as `os`/`cpu`-gated optional dependencies, so npm fetches only the
~460KB binary for the current machine and skips the others. Installing this
package is what opts you into that download — mods that never assemble patches
don't depend on it at all.

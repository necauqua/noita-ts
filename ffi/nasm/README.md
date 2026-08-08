# x86 patch assembly (`.asm` → `{ asm, vars, labels }`)

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

Assembling produces `{ asm, vars, labels }`:

- `asm`    – raw patch bytes (reloc fields zeroed)
- `vars`   – reloc name → byte offsets of its 32-bit field(s) in `asm`
- `labels` – every other `.text` label → its byte offset in `asm`

Assembly fails if the object contains any real relocations against `.text`
(absolute label refs or externs), since such a patch is not self-contained.

## Usage

Import `.asm` files directly. Wire the plugin in `tsconfig.json`:

```jsonc
{
  "tstl": { "luaPlugins": [{ "name": "@noita-ts/ffi/asm-plugin" }] }
}
```

then:

```ts
import patch from './patches/my_patch.asm';
// patch.asm, patch.vars.<reloc>, patch.labels.<label>, ...
```

The plugin assembles on resolve and serves the generated module entirely from
memory (nothing is written to the source tree or to disk); TSTL emits it into the
build output mirroring the source layout (`patches/my_patch.asm` → `patches/my_patch_asm.lua`)
and rewrites the require to it.

#### Types

Two options, pick one (don't combine — two `*.asm` blocks in one program collide):

**Loose (zero setup, fully transparent).** Reference the shipped fallback; no
install scripts, works on a fresh checkout:

```ts
/// <reference types="@noita-ts/ffi/asm" />
```

**Concrete (precise per-file `vars`/`labels`).** The plugin maintains a
`noita-asm` ambient-types package at `node_modules/@types/noita-asm`: a
`postinstall` seeds a loose fallback, and every build regenerates it with a
**concrete block per imported `.asm`** placed before the generic `*.asm` fallback
so it wins the wildcard match (types sharpen after the first build). Opt in by
adding it to your `tsconfig.json`:

```jsonc
{ "compilerOptions": { "types": ["noita-asm"] } }
```

> If your package manager runs with install scripts disabled, the postinstall
> won't seed the stub, so `types: ["noita-asm"]` errors until it exists. Seed it
> once with `node node_modules/@noita-ts/ffi/nasm/install-asm-types.mjs` (or just
> run one build — the plugin writes it during `beforeEmit`). Prefer the loose
> option above if you'd rather avoid that.

## nasm binary

`./nasm` (Linux) / `./nasm.exe` (Windows) is invoked directly; the platform
binary is picked automatically.

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

Nothing to configure. `@noita-ts/ffi` depends on **`@types/noita-ffi-asm`**, which
installs into `node_modules/@types/noita-ffi-asm` and is picked up automatically
(`@noita-ts/base/mod-tsconfig.json` sets `"types": ["*"]`, so any installed
`@types/*` contributes globally). No postinstall, no manual reference:

- **Before the first build** it ships a generic fallback (`vars`/`labels` typed
  as `Record<...>`), so `.asm` imports type-check immediately — even with install
  scripts disabled, since it arrives as a normal dependency, not a postinstall.
- **Each `nts build`** the asm-plugin overwrites the installed copy with a
  **concrete block per imported `.asm`** (exact `vars`/`labels` keys) placed
  before the generic `*.asm` fallback so it wins the wildcard match — types
  sharpen automatically after the first build.

> Escape hatch: if you've pinned an explicit `types` array (dropping `"*"`), add
> `"noita-ffi-asm"` to it, or reference the shipped loose block directly with
> `/// <reference types="@noita-ts/ffi/asm" />`. Don't combine the loose block
> with `@types/noita-ffi-asm` — two generic `*.asm` blocks in one program collide.

## nasm binary

`./nasm` (Linux) / `./nasm.exe` (Windows) is invoked directly; the platform
binary is picked automatically.

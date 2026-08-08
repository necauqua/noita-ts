# @types/noita-ffi-asm

Ambient types for `*.asm` x86-patch imports assembled by
[`@noita-ts/ffi`](../ffi). It's a dependency of `@noita-ts/ffi`, installs into
`node_modules/@types/noita-ffi-asm`, and is picked up automatically by mods that
extend `@noita-ts/base/mod-tsconfig.json` (`"types": ["*"]`).

- Ships a **generic** fallback (`vars`/`labels` as `Record<...>`) so `.asm`
  imports type-check before the first build — no postinstall required.
- Each `nts build`, the `@noita-ts/ffi` asm-plugin overwrites the installed
  `index.d.ts` with a **concrete block per imported `.asm`** (exact `vars`/`labels`
  keys), placed before the generic `*.asm` fallback so it wins the wildcard match.

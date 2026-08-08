# noita-ts

Write [Noita](https://noitagame.com/) mods in TypeScript, powered by
[TypeScriptToLua](https://typescripttolua.github.io/).

Get started with:

```sh
npm create @noita-ts/mod
```

This scaffolds a ready-to-run mod with typed access to the Noita Lua API,
component types, mod settings support and an `nts` CLI to build, run and
publish it.

## Quick tour

```ts
// src/init.ts
import mod from "@noita-ts/base";

// thin typed wrapper for setting the global callbacks
// you can always do `(globalThis as any).OnPlayerSpawned = () => {}` and similar
mod.on("PlayerSpawned", () => {
  GamePrint("Hello World");
});
```

```sh
npx nts run             # launch an isolated Noita instance with the mod installed
npx nts build           # build a distributable mod zip into dist/
npx nts publish "notes" # publish/update the mod on the Steam Workshop
npx nts unpak           # unpack data.wak
```

Mod metadata (id, name, description, workshop settings, etc.) lives in
`package.json` under `noita.*` keys - see the
[template readme](create-mod/template/readme.md) for the full list.

## Packages

- [`@noita-ts/base`](base) - the core: typed mod hooks, settings support, and
  the `nts` CLI (build/run/publish/unpak). Depends on `@noita-ts/types` for the
  ambient API typings.
- [`@noita-ts/types`](types) - global ambient typings for mods (Noita Lua API +
  components, Lua stdlib, TSTL language extensions). Its `bin/` holds the
  internal generator that produces the definitions from Noita's Lua API docs.
- [`@noita-ts/ffi-asm-types`](types/ffi-asm) - ambient types for `*.asm` x86-patch
  imports assembled by `@noita-ts/ffi`.
- [`@noita-ts/create-mod`](create-mod) - the `npm create` scaffolder.
- [`@noita-ts/nxml`](nxml) - types and packaging for
  [luanxml](https://github.com/NathanSnail/luanxml), a parser for Noita's
  quirky XML dialect.
- [`@noita-ts/pollnet`](pollnet) - networking for unsafe mods via
  [pollnet](https://github.com/probable-basilisk/pollnet), bundling the 32-bit
  dll and a Noita-specific loader.
- [`@noita-ts/ffi`](ffi) - LuaJIT FFI helpers/types for unsafe mods.
- [`@noita-ts/dear-imgui-types`](types/dear-imgui) - type
  definitions for [Noita-Dear-ImGui](https://github.com/dextercd/Noita-Dear-ImGui)
  (ImGui 1.26.0).

## Licence
Just MIT, see the LICENSE file.

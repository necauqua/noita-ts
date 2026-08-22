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
npx nts build --no-emit # build nothing, just report the files the mod would contain
npx nts test            # run src/test.ts in a headless Noita container
npx nts publish "notes" # publish/update the mod on the Steam Workshop
npx nts unpak           # unpack data.wak
```

Tests live in `src/tests/`, which regular builds leave out entirely - every
file in there is picked up on its own, no index to maintain:

```ts
// src/tests/player.ts
import { assert, test } from "@noita-ts/base/test";

test("the player is there", () => {
  assert(GameGetPlayerStatsEntity() != 0, "no player");
});
```

`nts test` builds the mod with those files as extra entry points, boots it in a
[noita-docker](https://github.com/necauqua/noita-docker) container and reports
what the game log said - see [test/](test) for a worked example.

Mod metadata (id, name, description, workshop settings, etc.) lives in
`package.json` under `noita.*` keys - see the
[template readme](create-mod/template/readme.md) for the full list.

## Packages

- [`@noita-ts/base`](base) - the core: typed mod hooks, settings support, an
  in-game test runner (`@noita-ts/base/test`), and the `nts` CLI
  (build/run/test/publish/unpak). Also ships the ambient API typings in
  [`base/types`](base/types) (Noita Lua API + components, Lua stdlib, TSTL
  language extensions), exposed as `@noita-ts/base/types`; its `bin/` holds the
  internal generator that produces the definitions from Noita's Lua API docs.
- [`@noita-ts/create-mod`](create-mod) - the `npm create` scaffolder.
- [`@noita-ts/nxml`](nxml) - types and packaging for
  [luanxml](https://github.com/NathanSnail/luanxml), a parser for Noita's
  quirky XML dialect.
- [`@noita-ts/pollnet`](pollnet) - networking for unsafe mods via
  [pollnet](https://github.com/probable-basilisk/pollnet), bundling the 32-bit
  dll and a Noita-specific loader.
- [`@noita-ts/ffi`](ffi) - LuaJIT FFI helpers/types for unsafe mods.
- [`@noita-ts/nasm`](nasm) - the NASM assembler as a platform-gated package,
  plus the TSTL plugin that assembles inline `asm()` x86 patches at build time.
  Only mods that actually write patches depend on it (and download a binary).
- [`@noita-ts/noita-dear-imgui-types`](noita-dear-imgui-types) - type
  definitions for [Noita-Dear-ImGui](https://github.com/dextercd/Noita-Dear-ImGui)
  (ImGui 1.26.0).

## Licence
Just MIT, see the LICENSE file.

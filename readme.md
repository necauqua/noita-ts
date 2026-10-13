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
npx nts test            # run src/tests/ in a headless Noita container
npx nts publish "notes" # publish/update the mod on the Steam Workshop
npx nts unpak           # unpack the vanilla files of data.wak into noita/data/
```

`nts run` prints the game log (`noita/logger.txt`) into the console while the
game writes it. Ctrl+C asks the game to quit, so that it saves first - this
needs `xdotool` on Linux. A second Ctrl+C kills the game.

Tests live in `src/tests/`, which regular builds leave out entirely - every
file in there is picked up on its own, no index to maintain:

```ts
// src/tests/player.ts
import { assert, test } from "@noita-ts/base/test";

test("the player is there", () => {
  assert(GameGetPlayerStatsEntity(0) != 0, "no player stats");
});
```

`nts test` builds the mod with those files as extra entry points, boots it in a
[noita-docker](https://github.com/necauqua/noita-docker) container and reports
what the game log said - see [test/](test) for a worked example.

Mod metadata (id, name, description, workshop settings, etc.) lives in
`package.json` under `noita.*` keys - see the
[template readme](create-mod/template/readme.md) for the full list.

`nts publish` talks to the Steam client directly, so it needs Steam running and
logged in as someone who owns Noita - but not a Noita installation, and no
Proton on Linux. `--via-game` falls back to uploading through
`noita_dev.exe`, which is how this used to work.

A new item goes up unlisted, reachable only by its link, so you can look it over
before anyone finds it - `--visibility public` is what makes it findable, and
existing items keep whatever they were set to. It asks before doing anything
awkward to take back - publishing untagged, putting an unsafe mod up, letting
`--via-game` publish for everyone - and `--yes` answers all of it, which is also
what you need when nothing is there to answer with.

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
- [`@noita-ts/http`](http) - HTTP for unsafe mods without a DLL to ship: a
  client that uses WinINet on native threads (a drop-in replacement for the
  `HttpClient` of pollnet, without its HTTPS stalls in Wine), and a small
  HTTP/1.1 server with server-sent events on non-blocking Winsock sockets.
- [`@noita-ts/crypto`](crypto) - MD5, SHA-1/256/384/512, their HMAC, hex and
  secure random bytes for unsafe mods, from the CNG of Windows (`bcrypt.dll`),
  and Ed25519 verification (SSH signatures too) in plain Lua, without a DLL
  to ship.
- [`@noita-ts/ffi`](ffi) - LuaJIT FFI helpers/types for unsafe mods.
- [`@noita-ts/nasm`](nasm) - the NASM assembler as a platform-gated package,
  plus the TSTL plugin that assembles inline `asm()` x86 patches at build time.
  Only mods that actually write patches depend on it (and download a binary).
- [`@noita-ts/noita-dear-imgui-types`](noita-dear-imgui-types) - type
  definitions for [Noita-Dear-ImGui](https://github.com/dextercd/Noita-Dear-ImGui)
  (ImGui 1.26.0).

## Coding agents

`@noita-ts/base` ships a skill (in the [Agent Skills](https://agentskills.io/)
format) for agents that work on a noita-ts mod: how the build works, where to
look things up, the traps, and how to test in a headless Noita. A mod made with
`npm create @noita-ts/mod` has an `AGENTS.md` that points to
`node_modules/@noita-ts/base/skills/noita-ts-mod-dev/SKILL.md`. For another
mod, add that pointer to its `AGENTS.md`, or link the
`skills/noita-ts-mod-dev` folder into the skill folder of your agent (for
example `.agents/skills/`).

## Licence
Just MIT, see the LICENSE file.

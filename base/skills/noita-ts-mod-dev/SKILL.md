---
name: noita-ts-mod-dev
description: Write, build, test and publish Noita mods in TypeScript with noita-ts (@noita-ts/base, the `nts` CLI, TypeScriptToLua). Covers the project layout, how the build and the require shim work, Lua contexts and globals, LuaComponent scripts, file edits and appends, settings, GUI, async, typings and their traps, the vanilla files, headless tests in Docker/Podman, and the unsafe packages (ffi, pollnet, nasm). Use it for any work on a mod that depends on @noita-ts/base.
---

# noita-ts mod development

noita-ts compiles a TypeScript mod to Lua with
[TypeScriptToLua](https://typescripttolua.github.io/) (TSTL, LuaJIT target) and
packs it as a Noita mod. Its `nts` CLI builds, runs, tests and publishes the mod.
Source: <https://github.com/necauqua/noita-ts>.

Paths in this file that start with `node_modules/` are relative to the mod
root (or to a parent folder, when npm hoists the packages of a workspace).
Other files of this skill:

- [references/testing.md](references/testing.md): `nts test` in detail, and
  manual headless runs (screenshots, input, saves, other mods).
- [references/unsafe.md](references/unsafe.md): unsafe mods, `@noita-ts/ffi`,
  `@noita-ts/pollnet`, `@noita-ts/nasm`.

## Commands

Run them in the mod root (they read `package.json` and `src/` from the
current folder).

| command | what it does |
| --- | --- |
| `npx nts build` | type-checks and writes `dist/<id>.zip` |
| `npx nts build -A --dev` | writes the folder `dist/<id>/` instead, with `DEV = true` |
| `npx nts build --no-emit` | type-checks and lists the files of the mod, writes nothing; the fastest check |
| `npx nts test` | builds with `DEV` and `TEST`, runs `src/tests/` in headless Noita, see [testing](references/testing.md) |
| `npx nts unpak` | unpacks the vanilla files of `data.wak` into `noita/data/` (no game start; `--noita <path>` when Noita is not from Steam) |
| `npx nts run` | starts a local Noita instance in `noita/` with the mod (needs Steam; Proton on Linux) |
| `npx nts publish "notes"` | uploads to the Steam Workshop (needs a running Steam client) |

Add `-v` for verbose output. Each command has `--help`.

Any diagnostic stops the build: a type error, and also a TSTL warning (for
example a number used as a condition; compare it explicitly). A build that
succeeds is the minimum check after a change; `nts test` is the real one.

`nts run` opens a game window and blocks until the game exits; an agent
usually cannot use it. Ctrl+C asks the game to quit (needs `xdotool` on
Linux), a second Ctrl+C kills it. On the first run it makes `noita/` (hard
links to the Noita install, the intro and the update popup skipped) and
installs dev mods (Dear ImGui, Component Explorer, Unsafe Explorer, Spell Lab
Shugged, Enable Logger). The game log is `noita/logger.txt`, and `nts run`
prints it.

## A new mod

`npm create @noita-ts/mod` is interactive. Without a terminal, make the files
by hand:

```jsonc
// package.json
{
  "name": "my-mod",                  // the mod id, unless "noita.id" is set
  "description": "What it does",     // the mod description, unless "noita.description"
  "version": "0.1.0",
  "private": true,
  "noita.name": "My Mod",            // the name in the mod list
  "noita.compat": 12,                // writes compatibility.xml
  "scripts": { "build": "nts build", "test": "nts test" },
  "dependencies": { "@noita-ts/base": "latest" }
}
```

```jsonc
// tsconfig.json
{ "extends": "@noita-ts/base/mod-tsconfig.json" }
```

and `src/init.ts`, then `npm install`. Keep `node_modules`, `dist` and `noita`
out of version control.

Other `package.json` keys: `noita.id`, `noita.unsafe` (see
[unsafe](references/unsafe.md)), `noita.workshop.id` (`nts publish` writes it;
do not change it), `noita.workshop.name`, `noita.workshop.description`,
`noita.workshop.tags` (only the tags that Noita declares), `noita.workshop.skip-files`,
`noita.workshop.skip-folders`, and the mod.xml keys `noita.ui-newgame-name`,
`noita.ui-newgame-description`, `noita.ui-newgame-gfx-banner-bg`,
`noita.ui-newgame-gfx-banner-fg`, `noita.is-game-mode`,
`noita.game-mode-supports-save-slots`, `noita.is-translation`,
`noita.translation-xml-path`, `noita.translation-csv-path`.
`workshop-preview.png` in the mod root becomes the Workshop preview.

## What the build makes

- Each `src/**/*.ts` becomes `mods/<id>/<same path>.lua`; `src/foo/bar.ts` is
  `mods/<id>/foo/bar.lua`. Refer to it by that path in XML, in
  `ModLuaFileAppend` and so on: ``` `mods/${MOD_ID}/foo/bar.lua` ```.
- Every other file in `src/` (XML, PNG, CSV, `.bank`, `.lua`, DLL) is copied
  as it is, to the same path.
- `src/init.ts` is the mod entry, `init.lua`.
- `src/settings.ts` becomes `settings.lua`, bundled with its imports.
- `src/tests/**` and `src/test.ts` are left out, except in `nts test`.
- The Lua of dependencies goes to `mods/<id>/lua_modules/`.
- Also generated: `mod.xml`, `workshop.xml`, `mod_id.txt`,
  `compatibility.xml`, `require_shim.lua`.

`$mod` is a module that only the build knows:

```ts
import { MOD_ID, DEV, TEST } from "$mod";
// DEV: nts run, nts build --dev, nts test.  TEST: nts test only.
```

## Where to look things up

Read these before you guess an API, a field name or a file path.

- **Lua API**, with Nolla's notes:
  `node_modules/@noita-ts/base/types/generated/lua_api.d.ts`.
  Corrections and stricter types: `node_modules/@noita-ts/base/types/fixups.d.ts`
  (its declarations replace the generated ones).
- **Components and their fields**, with descriptions and defaults:
  `node_modules/@noita-ts/base/types/generated/components.d.ts`
  (`ComponentShapes`). Magic numbers: `types/magic-numbers.d.ts`. Setting
  types: `types/settings.d.ts`. Typed vanilla Lua modules (`perk_list`,
  `actions`, `status_effects`): `types/base-lua.d.ts`.
- **noita-ts library API**: `node_modules/@noita-ts/base/dist/index.d.ts`
  (`mod`), `dist/async.d.ts` (`Scheduler`), `dist/test.d.ts`; the readme and
  the `.d.ts` files of the other `@noita-ts/*` packages.
- **Vanilla game files** (`data/entities/...`, `data/scripts/...`,
  `data/translations/common.csv`): run `npx nts unpak` once, then read and
  search `noita/data/`. The folder is git-ignored, so give its path to search
  tools explicitly. How vanilla does a thing is the best example of how to do
  it.
- **The Noita install** (Steam: `steamapps/common/Noita/`):
  `tools_modding/lua_api_documentation.txt`, `component_documentation.txt`,
  `lua_debugging.txt`, and the example mods in `mods/` (`example`,
  `nightmare`, `starting_loadouts`).
- **Lua annotations** for hand-written `.lua` files (LuaLS):
  `node_modules/@noita-ts/base/dist/noita.d.lua`.
- **Online**: <https://noita.wiki.gg/wiki/Modding>.

Nolla's documentation has mistakes, and so the generated types do too. When
the engine disagrees with a type, the engine is right: fix it with a cast in
the mod, and report it.

## Lua contexts and globals

This is where most mistakes happen.

**Many Lua states.** `init.lua` and the hooks (`OnWorldPreUpdate` and so on)
run in the Lua state of the mod. Each `LuaComponent` script runs in a separate
state (by default one state per script file, shared by the components that
use it). The settings run in a state of their own. Module variables are not
shared between these states. Share data with `GlobalsSetValue`/`GlobalsGetValue`
(per world, saved), `VariableStorageComponent`s, `ModSettingSet`/`ModSettingGet`,
or `AddFlagPersistent`.

**The require shim.** Each compiled file starts with
`dofile_once('mods/<id>/require_shim.lua')`, which replaces the global
`require` of that state. It runs each imported module once per state, in a
separate environment whose reads fall back to `_G`. So:

- In an **imported** module, `declare let X; X = 1` writes into the
  environment of that module, not into `_G`. Write `_G` with
  `(globalThis as any).X = 1` (TSTL compiles `globalThis` to `_G`).
- A file that the **engine runs itself** (`init.lua`, a LuaComponent script,
  an appended file) is not under the shim: its global assignments reach `_G`.
- A `.ts` file **without `import`/`export`** is a script for TSTL: its
  top-level `function`, `const` and `let` become globals. With an
  `import`/`export`, they are locals.

**Hook callbacks** for the engine are globals:

```ts
// in a module file (has imports): set it on _G
(globalThis as any).death = (dmgTypes: number, msg: string) => { /* ... */ };

// in a script file (no imports/exports): a top-level function is global
function damage_received(damage: number, message: string) { /* ... */ }
```

**Imports of Lua files**:

- `import { f } from "data/scripts/lib/utilities.lua"` (vanilla) or
  `"mods/<id>/x.lua"` loads the file in a separate environment and gives its
  globals and return value. This does **not** apply mod appends
  (`ModLuaFileAppend`), and it puts the file into the `dofile_once` cache of the
  state, so a later `dofile_once` of the same file in that state does nothing.
  When you need the appends or the globals in `_G`, call
  `dofile("data/...lua")` instead.
- An own `.lua` file in `src/`: import it as `"mods/<id>/x.lua"`, or put an
  `x.d.ts` next to `x.lua` and import `"./x"`. `"./x.lua"` does not build.
- Any `.lua` import is `any` unless a `declare module` or `.d.ts` types it.

**Init-only APIs.** `ModLuaFileAppend`, `ModTextFileSetContent`,
`ModMagicNumbersFileAdd`, `ModMaterialsFileAdd`,
`ModRegisterAudioEventMappings` and the like work only while the mod
initialises: at the top level of `init.ts` (or in a module it imports), or in
`ModPreInit`/`ModInit`/`ModPostInit`. Lua appends to a file must be
registered before something loads that file.

## Common patterns

```ts
import { MOD_ID } from "$mod";
import mod from "@noita-ts/base";

// engine hooks; several callbacks for one hook run in order
mod.on("PlayerSpawned", (player) => GamePrint(`hello ${player}`));
mod.on("WorldPostUpdate", () => { /* each frame */ });
mod.on("PausePreUpdate", () => { /* each frame while paused */ });
// also ModPreInit, ModInit, ModPostInit, WorldInitialized, WorldPreUpdate,
// PausedChanged, PlayerDied, BiomeConfigLoaded, MagicNumbersAndWorldSeedInitialized
// ModSettingsChanged does not fire: use PausedChanged

// edit a text file (init only)
mod.edit("data/scripts/items/orb_pickup.lua", (s) =>
  string.gsub(s, "GameGetOrbCollectedAllTime%s-%b()", "true")[0]);

// append Lua to a vanilla file (init only); src/perk_append.ts is a script
// file that uses the globals of perk_list.lua (`declare const perk_list: ...`)
ModLuaFileAppend("data/scripts/perks/perk_list.lua", `mods/${MOD_ID}/perk_append.lua`);

// translations: append own CSV lines (a line break must separate them)
mod.edit("data/translations/common.csv",
  (s) => s + ModTextFileGetContent(`mods/${MOD_ID}/translations.csv`));
```

**XML edits** with `@noita-ts/nxml` (`npm i @noita-ts/nxml`), a parser for
Noita's XML dialect:

```ts
import nxml from "@noita-ts/nxml";

for (const xml of nxml.edit_file("data/entities/player_base.xml")) {
  xml.create_child("LuaComponent", {
    script_wand_fired: `mods/${MOD_ID}/wand_fired.lua`,
    execute_every_n_frame: -1,
  });
  for (const comp of xml.each_of("DamageModelComponent")) comp.set("hp", 8);
}
```

The loop writes the file back when it ends. Read `node_modules/@noita-ts/nxml/index.d.ts`
for the rest (`first_of`, `get`, `remove_child`, `expand_base`, ...).

**LuaComponent scripts.** Put the component in an entity XML (your own in
`src/`, or added with nxml) and write the script as a `.ts` file.
`script_source_file` runs the whole file each time it executes; the other
`script_*` fields call a global function (see the component docs for the
name and parameters, for example `script_death` calls `death(...)` when the
entity dies from damage, not on `EntityKill`). In the script,
`GetUpdatedEntityID()` is the entity.

```ts
// src/wand_fired.ts, a module (has imports), so the callback goes on _G
import { MOD_ID } from "$mod";
(globalThis as any).wand_fired = (gun: EntityID) => {
  GamePlaySound(`mods/${MOD_ID}/audio.bank`, "event", 0, 0);
};
```

**Settings.** `src/settings.ts` exports the setting list; `mod.settings.<id>`
reads and writes `ModSettingGet/Set("<mod id>.<id>")` with the right type.
`settings.ts` runs in the settings context (also in the main menu, without a
world), so neither it nor what it imports may use world APIs when it loads.

```ts
declare global {
  interface SettingsShape extends ExtractSettings<typeof import("./settings")> {}
}
export default [
  { id: "enabled", ui_name: "Enabled", value_default: true, scope: ModSettingScope.Runtime },
  { id: "count", ui_name: "Count", value_default: 3, value_min: 1, value_max: 10,
    scope: ModSettingScope.Runtime },
  { id: "mode", ui_name: "Mode", value_default: "a", values: [["a", "A"], ["b", "B"]],
    scope: ModSettingScope.NewGame },
] as const satisfies ModSetting[];
```

`as const satisfies ModSetting[]` is what gives `mod.settings.mode` the type
`"a" | "b"`. A setting also takes `onchange` and `draw` callbacks. To store a
value without UI, declare it in `SettingsShape` (`interface SettingsShape {
streak?: number }` in a `declare global`) and use `mod.settings.streak`.

**GUI** (immediate mode, each frame):

```ts
let gui: GuiID | undefined;
mod.on("WorldPostUpdate", () => {
  GuiStartFrame((gui ??= GuiCreate()));
  GuiText(gui, 10, 10, "hello");
  const [clicked] = GuiButton(gui, 1, 10, 20, "[click]"); // ids unique per frame
});
```

GUI drawn in `PausePreUpdate` shows over the pause menu. `GuiOption` is
exported from `@noita-ts/base`.

**Async.** `Scheduler.get()` from `@noita-ts/base/async` gives the scheduler
of the current Lua state (one per state), which polls itself each frame:

```ts
import Scheduler from "@noita-ts/base/async";
const scheduler = Scheduler.get();
(async () => {
  await scheduler.wait(60); // frames
  GamePrint("a second later");
})().catch(print_error);
```

Always catch the promise, or errors vanish.

In the mod state, it polls on `WorldPreUpdate` and `PausePreUpdate`. In a
LuaComponent script, it polls when the engine calls the global
`wake_up_waiting_threads`, which it does each frame only for a component with
`enable_coroutines="1"` and a `script_source_file` (once for each component
that shares the state; the scheduler polls only on the first call of a
frame). A callback (`script_wand_fired` and so on) runs in the Lua state of
its own file; with the default `vm_type`, that is the state of a
`script_source_file` with the same file. (With `ONE_PER_COMPONENT_INSTANCE`,
callbacks run in another state.) So, to start async work from a callback,
use one file for both:

```xml
<LuaComponent
  script_source_file="mods/my-mod/wand.lua" script_wand_fired="mods/my-mod/wand.lua"
  enable_coroutines="1" execute_on_added="1" execute_every_n_frame="-1" execute_times="1" />
```

```ts
// src/wand.ts
import Scheduler from "@noita-ts/base/async";
const scheduler = Scheduler.get();
(globalThis as any).wand_fired = (gun: EntityID) => {
  (async () => {
    await scheduler.wait(30);
    GamePrint("half a second after the shot");
  })().catch(print_error);
};
```

The script file runs again for each component that is added, but
`Scheduler.get()` keeps the scheduler of the state. If the script also loads
vanilla `data/scripts/lib/coroutines.lua`, load it before the first
`Scheduler.get()`.

**Base64.** `encode(bytes, options?)` and `decode(text, options?)` from
`@noita-ts/base/base64` convert a Lua string (bytes) to and from base64
(RFC 4648). The options are `STANDARD` (the default: `+`, `/`, `=` padding),
`STANDARD_NO_PAD`, `URL` (`-`, `_`) and `URL_NO_PAD`, or your own
`{ alphabet, padding }`. `decode` ignores any number of `=` at the end, and
gives `undefined` for other text that is not base64, white space included.

## TypeScriptToLua traps

- Arrays: TSTL adds 1 to the index only when the value has an array type.
  `(x as any)[0]` is Lua index 0 (nil). Cast to an array type first:
  `(x as unknown as Foo[])[0]`.
- `null` and `undefined` are both `nil`. A `nil` in an array can end it for
  `.length`, and `log("a", undefined, "b")` can drop arguments.
- Lua functions that return several values are typed `LuaMultiReturn`:
  `const [x, y] = EntityGetTransform(e)`. A call whose declared type is not
  `LuaMultiReturn` gives only the first value; a cast of the result does not
  help, cast the function:
  `const f = Fn as unknown as (this: void, a: X) => LuaMultiReturn<[A, B]>`.
  Collect all values with `[...f()]`.
- `this`: mods compile with `noImplicitSelf`, so plain functions take no
  `self`; object and class methods do. A method passed as a bare function to
  Lua loses its `self`.
- Lua's string library is there as `string.gsub`, `string.find`, `string.match`
  (Lua patterns; they return tuples, `[0]` is the first). JS string methods
  and `JSON` work through polyfills that the build adds.
- `print` and `print_error` of Noita take strings: give one template string,
  not several values (`print(a, 1)` is a Lua error).
- `Map`, `Set`, `Promise`, classes and spread work (TSTL polyfills).
  `LuaTable` from the language extensions is a plain Lua table.

## Typing traps

- Component IDs are typed per component:
  `EntityGetFirstComponent(e, "DamageModelComponent")` gives a
  `Component<"DamageModelComponent">`, and `ComponentGetValue2(c, "hp")` is then
  checked and typed. A plain `ComponentID` gives `unknown`.
- Fields with several values (vec2, ivec2, ValueRange(Int), aabb, iaabb,
  fcolor, xform) are got and set as several values:
  `const [vx, vy] = ComponentGetValue2(c, "mVelocity")`,
  `ComponentSetValue2(c, "mVelocity", vx, vy)`. `EntityAddComponent2` cannot
  set them.
- `GameGetPlayerStatsEntity(0)`, `GameGetGameEffect(...)` and others give 0,
  not `nil`, for "none".
- An API call with wrong arguments can return nothing instead of throwing:
  the engine only logs `Lua error - ...`. `nts test` fails the run on such a
  line.
- `EntityID`, `ComponentID` and `GuiID` are branded numbers: cast numbers from
  storage with `as EntityID`.

## Testing

`npx nts test` builds the mod with `DEV` and `TEST`, starts it in a
`noita-headless` container (Docker or Podman, a Noita install), and reports
the cases from `src/tests/**/*.ts` (and `src/test.ts`, loaded first):

```ts
// src/tests/stuff.ts — every file in src/tests/ is picked up
import Scheduler from "@noita-ts/base/async";
import { assert, assertEq, log, test } from "@noita-ts/base/test";

test("the world is there", () => {
  assert(GameGetWorldStateEntity() !== 0, "no world state");
});

test("later", async () => {
  await Scheduler.get().wait(30); // frames
  log("frame", GameGetFrameNum()); // shows in the report
  assertEq(GameGetPlayerStatsEntity(0) !== 0, true, "player stats");
});
```

The tests start on the first `WorldPreUpdate` (frame 0), all at the same
time. The player does not exist yet then: it appears about 10 frames later
(wait for `EntityGetWithTag("player_unit")`). Prefer a test for each
behaviour change. Read [references/testing.md](references/testing.md) for the
requirements, the options (`--keep`, `-l`, `--seed`, `--docker podman`),
debugging, screenshots and input.

## Publishing

`npx nts publish "change notes"` talks to the Steam client (it must run,
logged in to an account that owns Noita). A new item is unlisted; `--visibility
public` makes it public. It asks before risky steps; `--yes` answers yes.
Unsafe mods do not load from the Workshop without a DLL patch. Do not publish
unless the user asks for it.

## When noita-ts itself is wrong

The source is <https://github.com/necauqua/noita-ts>. Packages: `base` (the
CLI in `base/bin/`, runtime in `base/src/`, typings in `base/types/`),
`create-mod`, `nxml`, `ffi`, `pollnet`, `nasm`,
`noita-dear-imgui-types`, and `test` (the integration test mod). To try a
local change in a mod, build the package there (`npm run prepublishOnly`) and
depend on it with `"@noita-ts/base": "file:../noita-ts/base"`.

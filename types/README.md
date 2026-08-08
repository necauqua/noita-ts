# @types/noita-ts

Global ambient typings for Noita TypeScript mods:

- the Noita Lua API (`GameGetFrameNum`, `EntityGetComponent`, …) and component
  shapes (generated from the game's docs),
- the Lua standard library (`lua-types/jit`),
- the TypeScript-to-Lua language extensions (`LuaMultiReturn`, `LuaTable`, …).

It installs into `node_modules/@types/noita-ts` and is a dependency of
`@noita-ts/base`, so mods extending `@noita-ts/base/mod-tsconfig.json`
(`"types": ["*"]`) get all of these globally with no configuration.

The `generated/` API/component definitions are produced by this package's own
generator in [`bin/`](bin) (run via `npm run typegen`, invoked from
`prepublishOnly`). `bin/` is dev-only — it's excluded from the published tarball
(only `*.d.ts` and `generated/*.d.ts` are shipped). The generated files are
git-ignored and regenerated on publish, then included in the tarball.

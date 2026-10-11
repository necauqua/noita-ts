# AGENTS.md

This is a [Noita](https://noitagame.com/) mod in TypeScript, built with
[noita-ts](https://github.com/necauqua/noita-ts).

Before you work on it, read the noita-ts skill:
`node_modules/@noita-ts/base/skills/noita-ts-mod-dev/SKILL.md` (run
`npm install` first if `node_modules/` is missing). It tells how the build
works, where to find the API and the vanilla files, the traps of
TypeScriptToLua and Noita, and how to test the mod in a headless Noita.

Checks:

- `npx nts build --no-emit` must pass (type-checks the whole mod).
- `npx nts test` runs `src/tests/` in a headless Noita (needs Docker or
  Podman and the `noita-headless` image).

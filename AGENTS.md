# AGENTS.md

## Testing

This is a monorepo of npm workspaces. A change in one package often affects the
others through their built `dist/` output, so always test before finishing.

To test a change:

1. In the package you modified, run `npm run prepublishOnly`. This rebuilds its
   `dist/` from scratch.
2. In the `test/` package, run `npm test`. This builds the integration-test mod
   and boots it in a headless Noita container.

Prefer adding a test in `test/src/tests/` for anything that changes behaviour.
At minimum, run the suite as a smoke test after finishing any work.

Note: `npm test` needs Docker (or Podman), a `noita-headless` image, and a Noita
install. See `test/readme.md` for the full requirements.

## Conventions

Follow conventional commit messages. See [conventional
commits](https://www.conventionalcommits.org/en/v1.0.0/).

When there's no better option, use the package name as the scope,
for example `feat(ffi)`, `fix(base)` or `docs(test)`.

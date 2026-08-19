# noita-ts integration tests

Tests that need a real running Noita engine - anything touching the FFI layer,
engine globals or the Lua API in ways that cannot be checked at build time.

It is an ordinary mod driven by `nts test`: the cases in `src/tests/*.ts`
register themselves with the runner in
[`@noita-ts/base/test`](../base/src/test.ts). The command builds the mod with
every one of those files required from `init.lua`, boots it in a headless
Noita container, follows the game log until the report arrives and fails if
any case did.

```sh
cd test
npm test                    # nts test
npx nts test --keep         # leave the container up to poke at it
npx nts test --seed 12345   # deterministic world
```

Requirements: Docker or Podman, a `noita-headless` image built from
[noita-docker](https://github.com/necauqua/noita-docker), a Noita install
(found through Steam by default), and built `base`/`ffi` packages.

Run `npx nts test --help` for the rest of the options (`--image`, `--docker`,
`--noita`, `--timeout`).

## Adding a test

```ts
// src/tests/my-thing.ts
import { assert, assertEq, test } from "@noita-ts/base/test";
import { scheduler } from "../async";

test("something holds", () => {
  assertEq(GameGetFrameNum() >= 0, true, "frame number");
});

test("something holds later", async () => {
  await scheduler.wait(60); // frames
  assert(GameGetFrameNum() >= 60, "the world did not run");
});
```

Dropping the file in is all it takes - `nts test` requires everything under
`src/tests/` (plus an optional `src/test.ts`, for whatever the cases need set
up before they load).

Cases run concurrently as soon as the world is up, so one waiting for frames
does not hold up the rest and the suite takes as long as its slowest case.
Anything a test throws (a failed assert included) fails only that case.

Waiting for frames needs a scheduler that the mod polls; this mod keeps one in
`src/async.ts`, imported from `src/init.ts` so that it is registered in regular
builds too.

`log()` from the same module prints into the report, which shows up in the
command output the moment it happens - handy for dumping values while
investigating.

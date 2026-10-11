# Testing noita-ts mods in headless Noita

## Requirements

- Docker or Podman. With Podman, pass `--docker podman` (unless `docker` is
  a Podman wrapper).
- The `noita-headless` image (Wine + Xvfb + software OpenGL, no GPU needed),
  built once from <https://github.com/necauqua/noita-headless>:

  ```sh
  git clone https://github.com/necauqua/noita-headless
  cd noita-headless && docker build -t noita-headless .   # or: just build
  ```

  `docker image inspect noita-headless` tells whether it is there. Another tag:
  `--image <tag>`.
- A Noita install. `nts test` finds the Steam one; else `--noita <path>` (the
  folder with `noita.exe`). It is mounted read-only and is not changed.

## What `nts test` does

1. Builds the mod with `DEV = true` and `TEST = true` into `dist/test/<id>/`.
   `init.lua` then also requires the test runner, `src/test.ts` (if there is
   one) and every file in `src/tests/` (sorted by path).
2. Starts a container with that folder as its only mod (and the image's own
   harness mod), a new world (no save is kept), and the game arguments
   `-gamemode 0 -no_logo_splashes`.
3. Follows the game log (`docker logs`) and prints the `[nts-test]` lines of
   the report as they come.
4. Stops and removes the container, and exits with 1 if anything failed.

The run fails when a case fails, and also when:

- the log has a `Lua error - ...` line anywhere, also outside the cases (for
  example an API call with wrong arguments, or an error in a LuaComponent
  script);
- the mod does not load (`Lua (DoFile) error`, `Error loading lua script`);
- the game dies (for example an FFI read of a bad pointer);
- the report does not come in time (`--timeout <seconds>`, default 300).

Options: `-l` prints the whole game log too (use it when the mod does not
load), `--seed <n>` sets the world seed, `--keep` leaves the container
running, `-v` is verbose.

## The test API

```ts
import { assert, assertEq, log, test } from "@noita-ts/base/test";

test("name", () => { /* sync */ });
test("name", async () => { /* async, await frames with a Scheduler */ });
assert(condition, "message");          // fails the case unless condition
assertEq(actual, expected, "what");    // compares with ===
log("value", x);                       // a line in the report
```

- Each file in `src/tests/` is a module that registers cases; no index file.
  `src/test.ts` loads first: put setup there, or import the files whose cases
  must register (and so start) first.
- All cases start together on the first `WorldPreUpdate` (frame 0) and run
  at the same time. A throw or a failed assert fails only its own case.
- At frame 0 the world state entity and `GameGetPlayerStatsEntity(0)` exist,
  but the player does not: it spawns about 10 frames later. Wait for it:

  ```ts
  const scheduler = Scheduler.get(); // from "@noita-ts/base/async"
  while ((EntityGetWithTag("player_unit") ?? []).length === 0) {
    await scheduler.tick();
  }
  ```

- Everything that `init.ts` does at load is done before the cases register,
  so the cases see the file edits, appends and hooks of the mod.
- To check a LuaComponent script, load an entity that has it, wait some
  frames, and look at what the script left (for example a `GlobalsSetValue`
  key). The script runs in another Lua state, so the test cannot see its
  variables.

  ```ts
  const [x, y] = GameGetCameraPos();
  EntityLoad(`mods/${MOD_ID}/entities/probe.xml`, x, y);
  await scheduler.wait(5);
  assertEq(GlobalsGetValue("my_mod.ran", ""), "1", "the script ran");
  ```
- `DEV` and `TEST` from `$mod` let the mod itself act differently in tests.

## Reading failures

- Error locations are in the generated Lua, for example
  `[string "mods/<id>/tests/foo.lua"]:35`: read line 35 of
  `dist/test/<id>/tests/foo.lua`.
- `print` during mod initialisation (the top level of `init.ts`,
  `ModPreInit`, `ModInit`) does not reach the log of the headless game;
  `print_error` does. After the world starts, `print` works too.
- `log()` of the test API takes any values; `print` and `print_error` take
  strings only.

## Screenshots and input

For a visual check, keep the container of a test run:

```sh
npx nts test --keep        # prints: Leaving nts-test-<pid> running (--keep)
sleep 8                    # the first fade-in
docker exec nts-test-<pid> /screenshot.sh > shot.png
docker exec nts-test-<pid> xdotool key Escape                  # pause menu
docker exec nts-test-<pid> xdotool mousemove 640 360 click 1
docker logs nts-test-<pid>                                     # the game log
docker rm -f nts-test-<pid>                                    # when done
```

The screen is 1280x720. Then look at the PNG (an image viewer, or an agent
tool that reads images). The mod needs at least one test for `nts test` to
work; `--keep` keeps the container also when the run fails.

All test containers have the label `ua.necauq.noita-ts.test`:
`docker ps -a --filter label=ua.necauq.noita-ts.test`. `nts test` removes its
own containers and the ones that earlier runs left, except the ones of
`--keep`.

## Running the image by hand

For a save that stays, other mods, a network, or a normal (non-test) build:

```sh
# a folder that has only mod folders in it (each with its mod_id.txt),
# for example dist/test/ after `nts test`, or a copy of dist/<id>/ after
# `npx nts build -A --dev`; do not mount dist/ itself, as dist/test/ would
# become a broken mod
docker run --rm -d --name noita-x \
  -v "<noita install>:/noita:ro" \
  -v "<mods folder>:/mods:ro" \
  noita-headless -gamemode 0 -no_logo_splashes
docker exec noita-x /wait-ready.sh 180   # returns when the world is up
sleep 8
docker exec noita-x /screenshot.sh > shot.png
docker exec noita-x /shutdown.sh 10      # closes the game, so that it saves
docker rm -f noita-x
```

- Every mod folder in `/mods` is enabled. Put other mods (dependencies) there
  too.
- `-v <folder or volume>:/appdata` keeps the save: `/appdata` is `LocalLow`
  and holds `Nolla_Games_Noita/`, so you can also put save files there before
  the start. Without it, every start is a new game.
- `-e NOITA_WORLD_SEED=<n>` sets the seed.
- `--network host` lets the mod reach a server on `localhost` of the host,
  and the host reach a server of the mod.
- `-e NOITA_VNC=1 -p localhost:5900:5900` starts a VNC server for a live view.
- With Podman, Dockerfiles need full image names
  (`docker.io/library/debian:trixie-slim`).

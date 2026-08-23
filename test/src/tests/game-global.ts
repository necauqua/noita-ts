import ffi from "@noita-ts/ffi";
import GAME_GLOBAL from "@noita-ts/ffi/game-global";
import { assert, assertEq, log, test } from "@noita-ts/base/test";
import Scheduler from "@noita-ts/base/async";

const scheduler = Scheduler.get();

test("GAME_GLOBAL is reachable", () => {
  assert(GAME_GLOBAL[0] != undefined, "GAME_GLOBAL points at nothing");
});

test("GAME_GLOBAL.frame_counter matches GameGetFrameNum()", async () => {
  // a few frames in, so that a stray zero cannot pass for the frame counter
  await scheduler.wait(60);

  const frame = GAME_GLOBAL[0].frame_counter;
  log("GAME_GLOBAL.frame_counter =", frame);
  assert(frame > 0, "frame_counter is still zero after 60 frames");
  assertEq(frame, GameGetFrameNum(), "frame_counter");
});

test("GAME_GLOBAL.no_logo_splashes is set by -no_logo_splashes", () => {
  assertEq(GAME_GLOBAL[0].no_logo_splashes, true, "no_logo_splashes");
});

test("GameGlobal layout starts with the frame counters", async () => {
  await scheduler.wait(60);

  // the same read done without the struct definition, as a layout cross-check
  const raw = ffi.cast("uint32_t*", GAME_GLOBAL[0]);
  assertEq(raw[0], GameGetFrameNum(), "dword at +0x00");
});

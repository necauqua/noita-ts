import PLATFORM from "@noita-ts/ffi/platform";
import { assert, assertEq, log, test } from "@noita-ts/base/test";
import Scheduler from "@noita-ts/base/async";

const scheduler = Scheduler.get();

test("PLATFORM.app_config is readable", () => {
  const config = PLATFORM.app_config[0];
  assert(config != undefined, "app_config points at nothing");
  log("PLATFORM.app_config.language =", config.language);
  log("PLATFORM.app_config.mods_active =", config.mods_active);
  assertEq(tostring(config.language), "en", "app_config.language");
});

test("PLATFORM.frame_count keeps up with the engine", async () => {
  await scheduler.wait(60);

  const frames = PLATFORM.frame_count;
  log("PLATFORM.frame_count =", frames);
  assert(frames >= GameGetFrameNum(), `frame_count is only ${frames}`);
});

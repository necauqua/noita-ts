import GLOBAL_STATS from "@noita-ts/ffi/global-stats";
import { assertEq, log, test } from "@noita-ts/base/test";

test("GLOBAL_STATS.STATS_VERSION is the version the game writes", () => {
  log("GLOBAL_STATS.STATS_VERSION =", GLOBAL_STATS.STATS_VERSION);
  assertEq(GLOBAL_STATS.STATS_VERSION, 4, "STATS_VERSION");
});

test("GLOBAL_STATS.session.dead is false while alive", () => {
  // a nested struct read: GlobalStats -> GameStats -> bool
  assertEq(GLOBAL_STATS.session.dead, false, "session.dead");
});

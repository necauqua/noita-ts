import GLOBAL_STATS from "@noita-ts/ffi/global-stats";
import { assert, assertEq, log, test } from "@noita-ts/base/test";

test("GLOBAL_STATS.STATS_VERSION is the version the game writes", () => {
  log("GLOBAL_STATS.STATS_VERSION =", GLOBAL_STATS.STATS_VERSION);
  assertEq(GLOBAL_STATS.STATS_VERSION, 4, "STATS_VERSION");
});

test("GLOBAL_STATS.session.dead is false while alive", () => {
  // a nested struct read: GlobalStats -> GameStats -> bool
  assertEq(GLOBAL_STATS.session.dead, false, "session.dead");
});

test("GLOBAL_STATS.KEY_VALUE_STATS maps strings to numbers", () => {
  const stats = GLOBAL_STATS.KEY_VALUE_STATS.getAll();
  for (const [key, value] of Object.entries(stats)) {
    log(`GLOBAL_STATS.KEY_VALUE_STATS["${key}"] =`, value);
    assertEq(type(key), "string", "key");
    assertEq(type(value), "number", `value of '${key}'`);
    assertEq(GLOBAL_STATS.KEY_VALUE_STATS.get(key), value, `get('${key}')`);
  }
  assert(
    GLOBAL_STATS.KEY_VALUE_STATS.get("no such stat") == undefined,
    "a missing key read as something",
  );
});

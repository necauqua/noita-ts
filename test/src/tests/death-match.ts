import ffi from "@noita-ts/ffi";
import DEATH_MATCH, { DeathMatch } from "@noita-ts/ffi/death-match";
import { assertEq, log, test } from "@noita-ts/base/test";
import Scheduler from "@noita-ts/base/async";

const scheduler = Scheduler.get();

test("DEATH_MATCH is reachable and has the DeathMatch vftable", () => {
  assertEq(
    tonumber(ffi.cast("uint32_t", DEATH_MATCH[0].application_vftable)),
    ffi.locateVftable(".?AVDeathMatch@@"),
    "DEATH_MATCH.application_vftable",
  );
  assertEq(
    ffi.sizeof(DeathMatch.name),
    DeathMatch.size,
    "DeathMatch.size",
  );
});

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

test("DEATH_MATCH.player_entities holds the player", async () => {
  await scheduler.wait(60);

  const len = DEATH_MATCH[0].player_entities.len();
  log("DEATH_MATCH.player_entities.len() =", len);

  let count = 0;
  for (let slot = 0; slot < len; slot++) {
    const player = DEATH_MATCH[0].player_entities[slot];
    log(`DEATH_MATCH.player_entities[${slot}] =`, player);
    if (player != undefined) {
      count += 1;
    }
  }
  assertEq(count, 1, "non-null player_entities slots");

  const name = tostring(DEATH_MATCH[0].player_entities?.[0]?.[0]?.name);
  assertEq(name, "DEBUG_NAME:player", "first native player entity name");
});

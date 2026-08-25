import ffi from "@noita-ts/ffi";
import DEATH_MATCH from "@noita-ts/ffi/death-match";
import ENTITY_MANAGER from "@noita-ts/ffi/entity-manager";
import Scheduler from "@noita-ts/base/async";
import { assert, assertEq, log, test } from "@noita-ts/base/test";

const scheduler = Scheduler.get();

test("native player entity is reachable from its Lua ID", async () => {
  await scheduler.wait(60);

  const playerID = EntityGetWithTag("player_unit")[0];
  assert(playerID !== undefined, "player entity ID was not found");

  const player = ENTITY_MANAGER[0].getEntity(playerID);
  assert(player !== undefined, "native player entity was not found");

  const playerSlot = DEATH_MATCH[0].player_entities[0];
  assert(playerSlot !== undefined, "DeathMatch player slot was not populated");
  assertEq(
    tonumber(ffi.cast("uint32_t", player)),
    tonumber(ffi.cast("uint32_t", playerSlot)),
    "native player pointer",
  );

  const name = tostring(player[0].name);
  log("native player entity name =", name);
  assertEq(name, "DEBUG_NAME:player", "native player entity name");
});

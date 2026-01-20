import noita from "@noita-ts/base";
import { MOD_ID } from "$mod";

import * as utilities from "data/scripts/lib/utilities.lua";

import * as extra from "lua-mixed-in.lua";

ModLuaFileAppend(
  `data/scripts/gun/gun_actions.lua`,
  `mods/${MOD_ID}/custom-append.lua`,
);

noita.on("PlayerSpawned", (player) => {
  GamePrint(
    "polluted lua: " + ((globalThis as any).LUA_POLLUTION_HAPPENED || "<no>"),
  );
  GamePrint(
    "imported non-polluted: " + (extra.LUA_POLLUTION_HAPPENED || "<no>"),
  );
  GamePrint(
    "polluted lua totally: " +
      ((globalThis as any).LUA_POLLUTION_HAPPENED_TOTALLY || "<no>"),
  );

  const players: EntityID[] = utilities.get_players();
  GamePrint(`utilities get_players worked: ${players.includes(player)}`);
});

noita.on("PausedChanged", (is_paused, is_inventory_pause) => {
  GamePrint(
    `paused changed: is_paused: ${is_paused}, inventory pause: ${is_inventory_pause}`,
  );
});

noita.on("PlayerDied", (player_entity) => {
  GamePrint(`player died: ${player_entity}`);
});

GamePrint("mod id is: " + MOD_ID);

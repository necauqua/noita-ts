import { events } from "@noita-ts/base";

events.on("PlayerSpawned", (player_entity) => {
  GamePrint(`player spawned: ${player_entity}`);
});

events.on("PausedChanged", (is_paused, is_inventory_pause) => {
  GamePrint(
    `paused changed: is_paused: ${is_paused}, inventory pause: ${is_inventory_pause}`,
  );
});

events.on("PlayerDied", (player_entity) => {
  GamePrint(`player died: ${player_entity}`);
});

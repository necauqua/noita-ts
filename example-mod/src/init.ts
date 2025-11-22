import noita from "@noita-ts/base";

noita.on("PlayerSpawned", (player_entity) => {
  GamePrint(`player spawned: ${player_entity}`);
});

noita.on("PausedChanged", (is_paused, is_inventory_pause) => {
  GamePrint(
    `paused changed: is_paused: ${is_paused}, inventory pause: ${is_inventory_pause}`,
  );
});

noita.on("PlayerDied", (player_entity) => {
  GamePrint(`player died: ${player_entity}`);
});

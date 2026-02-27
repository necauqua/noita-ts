import mod from "@noita-ts/base";

mod.on("PlayerSpawned", () => {
  GamePrint("Hello World");
});

import ffi from "..";
import { Vec } from "../cpp";
import { Entity } from "./entity-manager";
import c from "../schema";

export const DeathMatch = c.declare("DeathMatch", [
  c.field("application_vftable", c.voidptr),
  c.field("mouse_listener_vftable", c.voidptr),
  c.field("keyboard_listener_vftable", c.voidptr),
  c.unknown(c.bool),
  c.field("joystick_listener_vftable", c.voidptr),
  c.field("simple_ui_listener_vftable", c.voidptr),
  c.field("event_listener_vftable", c.voidptr),
  c.unknown(60),
  c.field("player_entities", Vec(Entity.ptr())),
  c.unknown(44),
  c.field("is_game_over", c.bool),
]);

export type DeathMatch = typeof DeathMatch.type;

// mov [EDI], DeathMatch::vftable
const constructor = ffi.text.scanAll(
  [0xC7, 0x07, ...ffi.le32(ffi.locateVftable(".?AVDeathMatch@@"))],
  { name: "DeathMatch constructor vftable store" },
);

// mov [DEATH_MATCH], EDI
const deathMatchPos = ffi.text.scan([0x89, 0x3D], {
  at: constructor + 6,
  name: "DeathMatch constructor DEATH_MATCH store",
}) + 2;

const DEATH_MATCH = DeathMatch.ptr().ptr().ptr().cast(deathMatchPos)[0];

export namespace DEATH_MATCH { };
export default DEATH_MATCH;

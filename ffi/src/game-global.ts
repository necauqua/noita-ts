import ffi from ".";
import { NativeString } from "./cpp";
import c from "./schema";

export const GameGlobal = c.declare("GameGlobal", [
  c.field("frame_counter", c.i32),
  c.field("update_counter", c.i32),
  c.field("fx_time", c.f32),
  c.field("camera", c.voidptr),
  c.field("grid_world", c.voidptr),
  c.field("grid_world_renderer", c.voidptr),
  c.field("cell_factory", c.voidptr),
  c.field("root_sprite", c.voidptr),
  c.field("scene_layer", c.voidptr),
  c.field("audio_manager", c.voidptr),
  c.field("world_tree", c.voidptr),
  c.field("world_light_and_fog", c.voidptr),
  c.field("game_log", c.voidptr),
  c.field("world_state", c.voidptr),
  c.field("debug_ui", c.voidptr),
  c.field("camera_reposition_pending", c.bool),
  c.field("cell_factory2", c.voidptr),
  c.field("world_sim_data", c.voidptr),
  c.field("ui_flags", c.u32.ptr()),
  c.field("weather_config", c.voidptr),
  c.field("post_fx", c.voidptr),
  c.field("magic_numbers", c.voidptr),
  c.field("session_numbers", c.voidptr),
  c.field("restart_game_mode_idx", c.i32),
  c.field("save_slot", c.i32),
  c.field("requested_save_slot", c.i32),
  c.field("restart_request", c.i32),
  c.field("no_logo_splashes", c.bool),
  c.field("load_test_save", c.bool),
  c.field("startup_argument", NativeString),
]);

const locate = () => {
  let last = ffi.text.offset;

  for (let skip = 0; skip < 32; skip++) {
    // PUSH 0x10a
    const pushSize = ffi.text.scanAll([0x68, 0xa0, 0x01, 0x00, 0x00], {
      at: last,
      name: "GameGlobal accessor allocation",
    });
    last = pushSize + 5;

    const code = ffi.cast("uint8_t*", pushSize - 9);

    // We're basically searching for the following pattern:
    //   0xA1 <globalStorage>        ; mov eax, [<globalStorage>]
    //   0x85 0xC0                   ; test eax, eax
    //   0x75 <short offset forward> ; jnz <short offset forward>
    //   0x68 0x10 0x0A 0x00 0x00    ; push 0x10a

    if (
      code[0] !== 0xA1 ||
      code[5] !== 0x85 ||
      code[6] !== 0xC0 ||
      code[7] !== 0x75 ||
      code[8] < 5 ||
      code[8] > 0x7f
    ) {
      continue;
    }
    return GameGlobal.ptr().ptr().ptr().cast(ffi.cast("uint32_t*", pushSize - 8))[0];
  }
  throw "GameGlobal accessor not found";
};

const GAME_GLOBAL = locate();

export namespace GAME_GLOBAL {}
export default GAME_GLOBAL;

import ffi, { Ptr } from ".";

ffi.cdef(`
  typedef struct GameGlobal {
    int frame_counter;
    int update_counter;
    float fx_time;
    void* camera;
    void* grid_world;
    void* grid_world_renderer;
    void* cell_factory;
    void* root_sprite;
    void* scene_layer;
    void* audio_manager;
    void* world_tree;
    void* world_light_and_fog;
    void* game_log;
    void* world_state;
    void* debug_ui;
    bool camera_reposition_pending;
    void* cell_factory;
    void* world_sim_data;
    unsigned int* ui_flags;
    void* weather_config;
    void* post_fx;
    void* magic_numbers;
    void* session_numbers;
    int restart_game_mode_idx;
    int save_slot;
    int requested_save_slot;
    int restart_request;
    bool no_logo_splashes;
    bool load_test_save;
    cpp_string startup_argument;
  } GameGlobal;
`);

export type GameGlobal = {
  frame_counter: number;
  update_counter: number;
  fx_time: number;
};

const findGameGlobal = () => {
  // Look for PUSH 0x10a, which is the size of GameGlobal
  const allocation = [0x68, 0xa0, 0x01, 0x00, 0x00]; // asm('push 0x10a').raw

  let last = ffi.text.offset;

  for (let skip = 0; skip < 32; skip++) {
    const pushSize = ffi.text.scanAll(allocation, {
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
    return ffi.cast<Ptr<GameGlobal>>("GameGlobal**", ffi.cast("uint32_t*", pushSize - 8)[0]);
  }
  throw "GameGlobal accessor not found";
};

const GAME_GLOBAL = findGameGlobal();

export namespace GAME_GLOBAL { };
export default GAME_GLOBAL;

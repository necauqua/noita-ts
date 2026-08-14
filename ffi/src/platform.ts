import ffi from ".";

import './cpp-defs'

const KEYBINDS = [
  'key_up', 'key_down', 'key_left', 'key_right',
  'key_use_wand', 'key_spray_flask', 'key_throw', 'key_kick',
  'key_inventory', 'key_interact', 'key_drop_item', 'key_drink_potion',
  'key_item_next', 'key_item_prev', 'key_item_slot1', 'key_item_slot2', 'key_item_slot3', 'key_item_slot4',
  'key_item_slot5', 'key_item_slot6', 'key_item_slot7', 'key_item_slot8', 'key_item_slot9', 'key_item_slot10',
  'key_takescreenshot', 'key_replayedit_open', 'aim_stick', 'key_ui_confirm', 'key_ui_drag', 'key_ui_quick_drag',
] as const;

const decl = ['typedef struct ControlsConfig {\n'];
for (const key of KEYBINDS) {
  decl.push(`ControlsConfigKey ${key};`);
}
decl.push(`  float gamepad_analog_sticks_threshold;
  float gamepad_analog_buttons_threshold;
} ControlsConfig;`);

ffi.cdef(`
  typedef struct ControlsConfigKey {
    int primary;
    int secondary;
    cpp_string primary_name;
    cpp_string secondary_name;
  } ControlsConfigKey;
`)

ffi.cdef(table.concat(decl))

ffi.cdef(`
  typedef struct GraphicsSettings {
    int width;
    int height;
    int fullscreen;
    cpp_string caption;
    cpp_string icon_bmp;
    bool textures_resize_to_power_of_two;
    bool textures_fix_alpha_channel;
    int vsync;
    int current_display;
    void* external_context;
  } GraphicsSettings;

  typedef struct WizardAppConfig {
    void* vftable;
    int internal_size_w;
    int internal_size_h;
    int framerate;
    bool iphone_is_landscape;
    bool sounds;
    bool event_recorder_flush_every_frame;
    bool record_events;
    bool do_a_playback;
    cpp_string playback_file;
    bool report_fps;
    bool joysticks_enabled;
    float joystick_rumble_intensity;
    GraphicsSettings graphics_settings;
    void* set_random_seed_cb;
    bool has_been_started_before;
    bool audio_fmod;
    float audio_music_volume;
    float audio_effects_volume;
    bool rendering_low_quality;
    bool rendering_low_resolution;
    bool rendering_pixel_art_antialiasing;
    float rendering_brightness_delta;
    float rendering_contrast_delta;
    float rendering_gamma_delta;
    float rendering_teleport_flash_brightness;
    float rendering_cosmetic_particle_count_coeff;
    int backbuffer_width;
    int backbuffer_height;
    bool application_rendered_cursor;
    float screenshake_intensity;
    bool ui_inventory_icons_always_clickable;
    bool ui_allow_shooting_while_inventory_open;
    bool ui_report_damage;
    bool ui_show_world_hover_info_next_to_mouse;
    bool replay_recorder_enabled;
    unsigned int replay_recorder_max_budget_mb;
    unsigned int replay_recorder_max_resolution_x;
    unsigned int replay_recorder_max_resolution_y;
    cpp_string language;
    bool check_for_updates;
    cpp_string last_started_game_version_hash;
    unsigned int config_format_version;
    bool is_default_config;
    ControlsConfig keyboard_controls;
    ControlsConfig gamepad_controls;
    int gamepad_mode;
    bool rendering_filmgrain;
    bool online_features;
    float steam_cloud_size_warning_limit_mb;
    char _unknown; // huh
    bool mouse_capture_inside_window;
    bool ui_snappy_hover_boxes;
    bool application_pause_when_unfocused;
    bool gamepad_analog_flying;
    cpp_string mods_active;
    cpp_string mods_active_privileged;
    bool mods_sandbox_enabled;
    bool mods_sandbox_warning_done;
    bool mods_disclaimer_accepted;
    bool streaming_integration_autoconnect;
    cpp_string streaming_integration_channel_name;
    unsigned int streaming_integration_events_per_vote;
    float _unknown2; // ???
    float streaming_integration_time_seconds_voting;
    float streaming_integration_time_seconds_between_votings;
    bool streaming_integration_play_new_vote_sound;
    bool streaming_integration_viewernames_ghosts;
    bool streaming_integration_hide_votes_during_voting;
    bool streaming_integration_ui_pos_left;
    bool single_threaded_loading;
    cpp_string _unknown3; // ???
    bool DEBUG_DONT_LOAD_OTHER_CONFIG;
  } WizardAppConfig;

  typedef struct Platform {
    void* vftable;
    void* application;
    WizardAppConfig* app_config;
    float internal_height;
    float internal_width;
    bool input_disabled;
    void* graphics;
    bool fixed_time_step;
    int frame_count;
    int frame_rate;
    double last_frame_execution_time;
    double average_frame_execution_time;
    double one_frame_should_last;
    double time_elapsed_tracker;
    int width;
    int height;
    void* event_recorder;
    void* mouse;
    void* keyboard;
    void* touch;
    cpp_vector_void joysticks;
    void* sound_player;
    void* file_system;
    bool running;
    struct { float x; float y; } mouse_pos;
    int sleeping_mode;
    bool print_framerate;
    cpp_string working_dir;
    int random_i;
    int random_seed;
    bool joysticks_enabled;
  } Platform;
`)

export type ControlsConfigKey = {
  primary: number;
  secondary: number;
  primary_name: string;
  secondary_name: string;
}

export type ControlsConfig = {
  [key in (typeof KEYBINDS)[number]]: ControlsConfigKey;
};

enum FullscreenMode {
  WINDOWED = 0,
  STRETCHED = 1,
  FULL = 2,
}

enum VsyncMode {
  OFF = 0,
  ON = 1,
  ADAPTIVE = 2,
}

export type WizardAppConfig = {
  internal_size_w: number;
  internal_size_h: number;
  framerate: number;
  iphone_is_landscape: boolean;
  sounds: boolean;
  event_recorder_flush_every_frame: boolean;
  record_events: boolean;
  do_a_playback: boolean;
  playback_file: string;
  report_fps: boolean;
  joysticks_enabled: boolean;
  joystick_rumble_intensity: number;
  graphics_settings: {
    width: number;
    height: number;
    fullscreen: FullscreenMode;
    caption: string;
    icon_bmp: string;
    textures_resize_to_power_of_two: boolean;
    textures_fix_alpha_channel: boolean;
    vsync: VsyncMode;
    current_display: number;
  };
  has_been_started_before: boolean;
  audio_fmod: boolean;
  audio_music_volume: number;
  audio_effects_volume: number;
  rendering_low_quality: boolean;
  rendering_low_resolution: boolean;
  rendering_pixel_art_antialiasing: boolean;
  rendering_brightness_delta: number;
  rendering_contrast_delta: number;
  rendering_gamma_delta: number;
  rendering_teleport_flash_brightness: number;
  rendering_cosmetic_particle_count_coeff: number;
  backbuffer_width: number;
  backbuffer_height: number;
  application_rendered_cursor: boolean;
  screenshake_intensity: number;
  ui_inventory_icons_always_clickable: boolean;
  ui_allow_shooting_while_inventory_open: boolean;
  ui_report_damage: boolean;
  ui_show_world_hover_info_next_to_mouse: boolean;
  replay_recorder_enabled: boolean;
  replay_recorder_max_budget_mb: number;
  replay_recorder_max_resolution_x: number;
  replay_recorder_max_resolution_y: number;
  language: string;
  check_for_updates: boolean;
  last_started_game_version_hash: string;
  config_format_version: number;
  is_default_config: boolean;
  keyboard_controls: ControlsConfig;
  gamepad_controls: ControlsConfig;
  gamepad_mode: number;
  rendering_filmgrain: boolean;
  online_features: boolean;
  steam_cloud_size_warning_limit_mb: number;
  mouse_capture_inside_window: boolean;
  ui_snappy_hover_boxes: boolean;
  application_pause_when_unfocused: boolean;
  gamepad_analog_flying: boolean;
  mods_active: string;
  mods_active_privileged: string;
  mods_sandbox_enabled: boolean;
  mods_sandbox_warning_done: boolean;
  mods_disclaimer_accepted: boolean;
  streaming_integration_autoconnect: boolean;
  streaming_integration_channel_name: string;
  streaming_integration_events_per_vote: number;
  streaming_integration_time_seconds_voting: number;
  streaming_integration_time_seconds_between_votings: number;
  streaming_integration_play_new_vote_sound: boolean;
  streaming_integration_viewernames_ghosts: boolean;
  streaming_integration_hide_votes_during_voting: boolean;
  streaming_integration_ui_pos_left: boolean;
  single_threaded_loading: boolean;
  DEBUG_DONT_LOAD_OTHER_CONFIG: boolean;
};

export type Platform = {
  app_config: WizardAppConfig,
  internal_height: number;
  internal_width: number;
  input_disabled: boolean;
  fixed_time_step: boolean;
  frame_count: number;
  frame_rate: number;
  last_frame_execution_time: number;
  average_frame_execution_time: number;
  one_frame_should_last: number;
  time_elapsed_tracker: number;
  width: number;
  height: number;
  running: boolean;
  mouse_pos: { x: number; y: number; };
  sleeping_mode: number;
  print_framerate: boolean;
  working_dir: string;
  random_i: number;
  random_seed: number;
  joysticks_enabled: boolean;
};

const PLATFORM = ffi.cast<Platform>(
  "Platform*",
  require('./index').locateStaticGlobal(".?AVPlatformWin@poro@@")
);

export namespace PLATFORM { }

export default PLATFORM;

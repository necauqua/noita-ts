local ffi = require 'ffi'

require './cpp_defs'

ffi.cdef [[
    typedef struct {
        void* vftable;
        bool dead;
        int32_t death_count;
        int32_t streak;
        uint32_t world_seed;
        cpp_string killed_by;
        cpp_string killed_by_extra;
        struct { float x; float y; } death_pos;
        double playtime;
        cpp_string playtime_str;
        int32_t places_visited;
        int32_t enemies_killed;
        int32_t heart_containers;
        int64_t hp;
        int64_t gold;
        int64_t gold_all;
        bool gold_infinite;
        int32_t items;
        int32_t projectiles_shot;
        int32_t kicks;
        double damage_taken;
        double healed;
        int32_t teleports;
        int32_t wands_edited;
        int32_t biomes_visited_with_wands;
    } GameStats;

    typedef struct {
        void* vftable;
        int32_t STATS_VERSION;
        int32_t DEBUG_HOW_MANY_TIMES_DONE;
        bool DEBUG_IS_ON;
        int32_t DEBUG_HOW_MANY_RESETS;
        bool DEBUG_FIXED_STATS;
        bool session_dead;
        cpp_map_cpp_string_int32_t KEY_VALUE_STATS;
        GameStats session;
        GameStats highest;
        GameStats global;
        GameStats prev_best;
    } GlobalStats;
]]

return {
    default = ffi.cast(
      "GlobalStats*",
      require('./index').locateStaticGlobal(".?AVGlobalStats@@")
    )
}

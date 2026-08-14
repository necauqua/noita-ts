import ffi from '.';
import { CppStringIntMap } from './cpp-defs';

ffi.cdef(`
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
`);

export type GameStats = {
  dead: boolean;
  death_count: number;
  streak: number;
  world_seed: number;
  killed_by: string;
  killed_by_extra: string;
  death_pos: { x: number; y: number };
  playtime: number;
  playtime_str: string;
  places_visited: number;
  enemies_killed: number;
  heart_containers: number;
  hp: number;
  gold: number;
  gold_all: number;
  gold_infinite: boolean;
  items: number;
  projectiles_shot: number;
  kicks: number;
  damage_taken: number;
  healed: number;
  teleports: number;
  wands_edited: number;
  biomes_visited_with_wands: number;
};

export type GlobalStats = {
  STATS_VERSION: number;
  DEBUG_HOW_MANY_TIMES_DONE: number;
  DEBUG_IS_ON: boolean;
  DEBUG_HOW_MANY_RESETS: number;
  DEBUG_FIXED_STATS: boolean;
  session_dead: boolean;
  KEY_VALUE_STATS: CppStringIntMap;
  session: GameStats;
  highest: GameStats;
  global: GameStats;
  prev_best: GameStats;
};

const GLOBAL_STATS = ffi.cast<GlobalStats>("GlobalStats*", ffi.locateStaticGlobal(".?AVGlobalStats@@"));

export namespace GLOBAL_STATS { }
export default GLOBAL_STATS;

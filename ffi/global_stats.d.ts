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

type CppStringIntMap = {
  get(key: string): number | undefined;
  to_lua(): Record<string, number>;
  size: LuaLengthMethod<number>;
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

declare const GLOBAL_STATS: GlobalStats;

export default GLOBAL_STATS;

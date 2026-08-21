import ffi from '.';
import { NativeString, StringIntMap, Vec2 } from './cpp';
import c from './schema';

export const GameStats = c.declare('GameStats', [
  c.field("vftable", c.voidptr),
  c.field("dead", c.bool),
  c.field("death_count", c.i32),
  c.field("streak", c.i32),
  c.field("world_seed", c.u32),
  c.field("killed_by", NativeString),
  c.field("killed_by_extra", NativeString),
  c.field("death_pos", Vec2),
  c.field("playtime", c.f64),
  c.field("playtime_str", NativeString),
  c.field("places_visited", c.i32),
  c.field("enemies_killed", c.i32),
  c.field("heart_containers", c.i32),
  c.field("hp", c.i64),
  c.field("gold", c.i64),
  c.field("gold_all", c.i64),
  c.field("gold_infinite", c.bool),
  c.field("items", c.i32),
  c.field("projectiles_shot", c.i32),
  c.field("kicks", c.i32),
  c.field("damage_taken", c.f64),
  c.field("healed", c.f64),
  c.field("teleports", c.i32),
  c.field("wands_edited", c.i32),
  c.field("biomes_visited_with_wands", c.i32),
]);
export type GameStats = c.infer<typeof GameStats>;

export const GlobalStats = c.declare('GlobalStats', [
  c.field("vftable", c.voidptr),
  c.field("STATS_VERSION", c.i32),
  c.field("DEBUG_HOW_MANY_TIMES_DONE", c.i32),
  c.field("DEBUG_IS_ON", c.bool),
  c.field("DEBUG_HOW_MANY_RESETS", c.i32),
  c.field("DEBUG_FIXED_STATS", c.bool),
  c.field("session_dead", c.bool),
  c.field("KEY_VALUE_STATS", StringIntMap),
  c.field("session", GameStats),
  c.field("highest", GameStats),
  c.field("global", GameStats),
  c.field("prev_best", GameStats),
]);
export type GlobalStats = c.infer<typeof GlobalStats>;

const GLOBAL_STATS = GlobalStats.cast(ffi.locateStaticGlobal(".?AVGlobalStats@@"));

export namespace GLOBAL_STATS { }
export default GLOBAL_STATS;

/** @noSelfInFile */

declare namespace _ {
  export enum ActionType {
    Projectile,
    StaticProjectile,
    Modifier,
    DrawMany,
    Material,
    Other,
    Utility,
    Passive,
  }

  export type Action = {
    id: string;
    name: string;
    type: ActionType;
    recursive?: boolean;
    related_projectiles?: string[];
    related_extra_entities?: string[];
    action: (this: void, recursion_level: number, iteration: number) => void;
    deck_index?: number;
    custom_uses_logic?: boolean;
    mana?: number;
    sound_loop_tag?: string;
    description: string;
    sprite: string;
    spawn_level: string;
    spawn_probability: string;
    price: number;

    max_uses?: number;

    spawn_manual_unlock?: boolean;
    ai_never_uses?: boolean;
    never_unlimited?: boolean;
    is_dangerous_blast?: boolean;
    sprite_unidentified?: string;
    spawn_requires_flag?: string;
    custom_xml_file?: string;
  };

  export const actions: Action[];

  export const reflecting: boolean;
  export const current_action: Action | undefined;

  export const first_shot: boolean;
  export const reloading: boolean;
  export const start_reload: boolean;
  export const got_projectiles: boolean;

  export const discarded: Action[];
  export const deck: Action[];
  export const hand: Action[];

  export const c: {
    // action_id: string;
    // action_name: string;
    // action_description: string;
    // action_sprite_filename: string;
    // action_unidentified_sprite_filename: string;
    // action_type: ActionType;
    // action_spawn_level: string;
    // action_spawn_probability: string;
    // action_spawn_requires_flag: string;
    // action_spawn_manual_unlock: boolean;
    // action_max_uses: number;
    // custom_xml_file: string;
    // action_mana_drain: number;
    // action_is_dangerous_blast: boolean;
    // action_draw_many_count: number;
    // action_ai_never_uses: boolean;
    // action_never_unlimited: boolean;
    state_shuffled: boolean;
    state_cards_drawn: number;
    state_discarded_action: boolean;
    state_destroyed_action: boolean;
    fire_rate_wait: number;
    speed_multiplier: number;
    child_speed_multiplier: number;
    dampening: number;
    explosion_radius: number;
    spread_degrees: number;
    pattern_degrees: number;
    screenshake: number;
    recoil: number;
    damage_melee_add: number;
    damage_projectile_add: number;
    damage_electricity_add: number;
    damage_fire_add: number;
    damage_explosion_add: number;
    damage_ice_add: number;
    damage_slice_add: number;
    damage_healing_add: number;
    damage_curse_add: number;
    damage_drill_add: number;
    damage_null_all: number;
    damage_critical_chance: number;
    damage_critical_multiplier: number;
    explosion_damage_to_materials: number;
    knockback_force: number;
    reload_time: number;
    lightning_count: number;
    material: string;
    material_amount: number;
    trail_material: string;
    trail_material_amount: number;
    bounces: number;
    gravity: number;
    light: number;
    blood_count_multiplier: number;
    gore_particles: number;
    ragdoll_fx: number;
    friendly_fire: boolean;
    physics_impulse_coeff: number;
    lifetime_add: number;
    sprite: string;
    extra_entities: string;
    game_effect_entities: string;
    sound_loop_tag: string;
    projectile_file: string;
  };

  export const current_reload_time: number;
  export const shot_effects: {
    recoil_knockback: number;
  };
  export const active_extra_modifiers: string[];

  export const mana: number;
  export const state_shuffled: boolean;
  export const state_cards_drawn: boolean;
  export const state_discarded_action: boolean;
  export const state_destroyed_action: boolean;
  export const playing_permanent_card: boolean;
  export const use_game_log: boolean;

  export const gun: {
    actions_per_round: number;
    shuffle_deck_when_empty: boolean;
    reload_time: number;
    deck_capacity: number;
  };

  export const dont_draw_actions: boolean;
  export const force_stop_draws: boolean;
  export const shot_structure: unknown[];
  export const recursion_limit: number;

  export function add_projectile(xml: string): void;
}

export default _;

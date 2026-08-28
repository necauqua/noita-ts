declare module "data/scripts/status_effects/status_list.lua" {

  export type StatusEffect = {
    id: string;
    ui_name: string;
    ui_description: string;
    ui_icon: string;
    protects_from_fire?: true;
    effect_entity?: string;
    remove_cells_that_cause_when_activated?: true;
    is_harmful?: true;
    min_threshold_normalized?: number;
    ui_timer_offset_normalized?: number;
    extra_status_00?: string;
    effect_permanent?: true;
  };

  export const status_effects: StatusEffect[];
}

declare module "data/scripts/gun/gun_actions.lua" {

  export type Action = {
    id: string;
    name: string;
    type: import("../src").ActionType;
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
}

declare module "data/scripts/perks/perk_list.lua" {
  export type Perk = {
    id: string;
    ui_name: string;
    ui_description: string;
    ui_icon: string;
    perk_icon: string;

    game_effect?: string;
    game_effect2?: string;
    particle_effect?: string;
    one_off_effect?: boolean;
    do_not_remove?: boolean;
    stackable?: boolean;
    stackable_is_rare?: boolean;
    stackable_how_often_reappears?: number;
    stackable_maximum?: number;
    max_in_perk_pool?: number;
    not_in_default_perk_pool?: boolean;
    remove_other_perks?: string[];
    usable_by_enemies?: boolean;

    func?: (
      this: void,
      entity_perk_item: EntityID,
      entity_who_picked: EntityID,
      item_name: string,
      pickup_count: number,
    ) => void;
    func_enemy?: (
      this: void,
      entity_perk_item: EntityID,
      entity_who_picked: EntityID,
    ) => void;
    func_remove?: (
      this: void,
      entity_perk_item: EntityID,
      entity_who_picked: EntityID,
      item_name: string,
    ) => void;
  };

  export const perk_list: Perk[];
}

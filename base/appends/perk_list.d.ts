/// <reference path="../types/base.d.ts" />

declare namespace _ {
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

export default _;

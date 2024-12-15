/** !Auto-generated! */

/**
 * No documentation from Nolla
 */
declare function EntityLoad(filename: string, pos_x?: number, pos_y?: number): EntityID;

/**
 * No documentation from Nolla
 */
declare function EntityLoadEndGameItem(filename: string, pos_x?: number, pos_y?: number): EntityID;

/**
 * No documentation from Nolla
 */
declare function EntityLoadCameraBound(filename: string, pos_x?: number, pos_y?: number): void;

/**
 * Loads components from 'filename' to 'entity'. Does not load tags and other stuff.
 */
declare function EntityLoadToEntity(filename: string, entity: number): void;

/**
 * Note: works only in dev builds.
 */
declare function EntitySave(entity_id: EntityID, filename: string): void;

/**
 * No documentation from Nolla
 */
declare function EntityCreateNew(name?: string): EntityID;

/**
 * No documentation from Nolla
 */
declare function EntityKill(entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function EntityGetIsAlive(entity_id: EntityID): boolean;

/**
 * No documentation from Nolla
 */
declare function EntityAddComponent(entity_id: EntityID, component_type_name: string, table_of_component_values?: string[]): ComponentID;

/**
 * No documentation from Nolla
 */
declare function EntityRemoveComponent(entity_id: EntityID, component_id: ComponentID): void;

/**
 * Returns a table of component ids.
 */
declare function EntityGetAllComponents(entity_id: EntityID): number[];

/**
 * No documentation from Nolla
 */
declare function EntityGetComponent(entity_id: EntityID, component_type_name: string, tag?: string): ComponentID[] | null;

/**
 * No documentation from Nolla
 */
declare function EntityGetFirstComponent(entity_id: EntityID, component_type_name: string, tag?: string): ComponentID | null;

/**
 * No documentation from Nolla
 */
declare function EntityGetComponentIncludingDisabled(entity_id: EntityID, component_type_name: string, tag?: string): ComponentID[] | null;

/**
 * No documentation from Nolla
 */
declare function EntityGetFirstComponentIncludingDisabled(entity_id: EntityID, component_type_name: string, tag?: string): ComponentID | null;

/**
 * No documentation from Nolla
 */
declare function EntitySetTransform(entity_id: EntityID, x: number, y?: number, rotation?: number, scale_x?: number, scale_y?: number): void;

/**
 * Sets the transform and tries to immediately refresh components that calculate values based on an entity's transform.
 */
declare function EntityApplyTransform(entity_id: EntityID, x: number, y?: number, rotation?: number, scale_x?: number, scale_y?: number): void;

/**
 * No documentation from Nolla
 */
declare function EntityGetTransform(entity_id: EntityID): LuaMultiReturn<[number, number, number, number, number]>;

/**
 * No documentation from Nolla
 */
declare function EntityAddChild(parent_id: number, child_id: number): void;

/**
 * If passed the optional 'tag' parameter, will return only child entities that have that tag (If 'tag' isn't a valid tag name, will return no entities). If no entities are returned, might return either an empty table or nil.
 */
declare function EntityGetAllChildren(entity_id: EntityID, tag?: string): EntityID[] | null;

/**
 * No documentation from Nolla
 */
declare function EntityGetParent(entity_id: EntityID): EntityID;

/**
 * Returns the given entity if it has no parent, otherwise walks up the parent hierarchy to the topmost parent and returns it.
 */
declare function EntityGetRootEntity(entity_id: EntityID): EntityID;

/**
 * No documentation from Nolla
 */
declare function EntityRemoveFromParent(entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function EntitySetComponentsWithTagEnabled(entity_id: EntityID, tag: string, enabled: boolean): void;

/**
 * No documentation from Nolla
 */
declare function EntitySetComponentIsEnabled(entity_id: EntityID, component_id: ComponentID, is_enabled: boolean): void;

/**
 * No documentation from Nolla
 */
declare function EntityGetName(entity_id: EntityID): string;

/**
 * No documentation from Nolla
 */
declare function EntitySetName(entity_id: EntityID, name: string): void;

/**
 * Returns a string where the tags are comma-separated, or nil if 'entity_id' doesn't point to a valid entity.
 */
declare function EntityGetTags(entity_id: EntityID): string | null;

/**
 * Returns all entities with 'tag'.
 */
declare function EntityGetWithTag(tag: string): EntityID[];

/**
 * Returns all entities in 'radius' distance from 'x','y'.
 */
declare function EntityGetInRadius(pos_x: number, pos_y: number, radius: number): EntityID[];

/**
 * Returns all entities in 'radius' distance from 'x','y'.
 */
declare function EntityGetInRadiusWithTag(pos_x: number, pos_y: number, radius: number, entity_tag: string): EntityID[];

/**
 * No documentation from Nolla
 */
declare function EntityGetClosest(pos_x: number, pos_y: number): EntityID;

/**
 * No documentation from Nolla
 */
declare function EntityGetClosestWithTag(pos_x: number, pos_y: number, tag: string): EntityID;

/**
 * No documentation from Nolla
 */
declare function EntityGetWithName(name: string): EntityID;

/**
 * No documentation from Nolla
 */
declare function EntityAddTag(entity_id: EntityID, tag: string): void;

/**
 * No documentation from Nolla
 */
declare function EntityRemoveTag(entity_id: EntityID, tag: string): void;

/**
 * No documentation from Nolla
 */
declare function EntityHasTag(entity_id: EntityID, tag: string): boolean;

/**
 * Return value example: 'data/entities/items/flute.xml'. Incorrect value is returned if the entity has passed through the world streaming system.
 */
declare function EntityGetFilename(entity_id: EntityID): string;

/**
 * Returns the max entity ID currently in use. Entity IDs are increased linearly. 
 */
declare function EntitiesGetMaxID(): number;

/**
 * Deprecated, use ComponentGetValue2() instead.
 */
declare function ComponentGetValue(component_id: ComponentID, variable_name: string): string | null;

/**
 * Deprecated, use ComponentGetValue2() instead.
 */
declare function ComponentGetValueBool(component_id: ComponentID, variable_name: string): boolean | null;

/**
 * Deprecated, use ComponentGetValue2() instead.
 */
declare function ComponentGetValueInt(component_id: ComponentID, variable_name: string): number | null;

/**
 * Deprecated, use ComponentGetValue2() instead.
 */
declare function ComponentGetValueFloat(component_id: ComponentID, variable_name: string): number | null;

/**
 * Deprecated, use ComponentGetValue2() instead.
 */
declare function ComponentGetValueVector2(component_id: ComponentID, variable_name: string): LuaMultiReturn<[number, number | null]>;

/**
 * Deprecated, use ComponentSetValue2() instead.
 */
declare function ComponentSetValue(component_id: ComponentID, variable_name: string, value: string): void;

/**
 * Deprecated, use ComponentSetValue2() instead.
 */
declare function ComponentSetValueVector2(component_id: ComponentID, variable_name: string, x: number, y: number): void;

/**
 * Deprecated, use ComponentSetValue2() instead.
 */
declare function ComponentSetValueValueRange(component_id: ComponentID, variable_name: string, min: number, max: number): void;

/**
 * Deprecated, use ComponentSetValue2() instead.
 */
declare function ComponentSetValueValueRangeInt(component_id: ComponentID, variable_name: string, min: number, max: number): void;

/**
 * Deprecated, use ComponentSetValue2() instead.
 */
declare function ComponentSetMetaCustom(component_id: ComponentID, variable_name: string, value: string): void;

/**
 * Deprecated, use ComponentGetValue2() instead.
 */
declare function ComponentGetMetaCustom(component_id: ComponentID, variable_name: string): string | null;

/**
 * Deprecated, use ComponentObjectGetValue2() instead.
 */
declare function ComponentObjectGetValue(component_id: ComponentID, object_name: string, variable_name: string): string | null;

/**
 * Deprecated, use ComponentObjectSetValue2() instead.
 */
declare function ComponentObjectSetValue(component_id: ComponentID, object_name: string, variable_name: string, value: string): void;

/**
 * No documentation from Nolla
 */
declare function ComponentAddTag(component_id: ComponentID, tag: string): void;

/**
 * No documentation from Nolla
 */
declare function ComponentRemoveTag(component_id: ComponentID, tag: string): void;

/**
 * Returns a string where the tags are comma-separated, or nil if can't find 'component_id' component.
 */
declare function ComponentGetTags(component_id: ComponentID): string | null;

/**
 * No documentation from Nolla
 */
declare function ComponentHasTag(component_id: ComponentID, tag: string): boolean;

/**
 * Returns one or many values matching the type or subtypes of the requested field. Reports error and returns nil if the field type is not supported or field was not found. This is up to 7.5x faster than the old ComponentSetValue functions.
 */
declare function ComponentGetValue2(component_id: ComponentID, field_name: string): any | null;

/**
 * Sets the value of a field. Value(s) should have a type matching the field type. Reports error if the values weren't given in correct type, the field type is not supported, or the component does not exist. This is up to 20x faster than the old ComponentSetValue functions.
 */
declare function ComponentSetValue2(component_id: ComponentID, field_name: string, value_or_values: any): void;

/**
 * Returns one or many values matching the type or subtypes of the requested field in a component subobject. Reports error and returns nil if the field type is not supported or 'object_name' is not a metaobject.
 */
declare function ComponentObjectGetValue2(component_id: ComponentID, object_name: string, field_name: string): any | null;

/**
 * Sets the value of a field in a component subobject. Value(s) should have a type matching the field type. Reports error if the values weren't given in correct type, the field type is not supported or 'object_name' is not a metaobject.
 */
declare function ComponentObjectSetValue2(component_id: ComponentID, object_name: string, field_name: string, value_or_values: any): void;

/**
 * Creates a component of type 'component_type_name' and adds it to 'entity_id'. 'table_of_component_values' should be a string-indexed table, where keys are field names and values are field values of correct type. The value setting works like ComponentObjectSetValue2(), with the exception that multivalue types are not supported. Additional supported values are _tags:comma_separated_string and _enabled:bool, which basically work like the those fields work in entity XML files. Returns the created component, if creation succeeded, or nil.
 */
declare function EntityAddComponent2(entity_id: EntityID, component_type_name: any, table_of_component_values?: { [key: string]: any }): ComponentID;

/**
 * 'type_stored_in_vector' should be "int", "float" or "string".
 */
declare function ComponentGetVectorSize(component_id: ComponentID, array_member_name: string, type_stored_in_vector: string): number;

/**
 * 'type_stored_in_vector' should be "int", "float" or "string".
 */
declare function ComponentGetVectorValue(component_id: ComponentID, array_name: string, type_stored_in_vector: string, index: number): number | number | string | null;

/**
 * 'type_stored_in_vector' should be "int", "float" or "string".
 */
declare function ComponentGetVector(component_id: ComponentID, array_name: string, type_stored_in_vector: string): number | number | string[] | null;

/**
 * Returns true if the given component exists and is enabled, else false.
 */
declare function ComponentGetIsEnabled(component_id: ComponentID): boolean;

/**
 * Returns the id of the entity that owns a component, or 0.
 */
declare function ComponentGetEntity(component_id: ComponentID): EntityID;

/**
 * Returns a string-indexed table of string.
 */
declare function ComponentGetMembers(component_id: ComponentID): { [key: string]: string } | null;

/**
 * Returns a string-indexed table of string or nil.
 */
declare function ComponentObjectGetMembers(component_id: ComponentID, object_name: string): { [key: string]: string } | null;

/**
 * No documentation from Nolla
 */
declare function ComponentGetTypeName(component_id: ComponentID): string;

/**
 * No documentation from Nolla
 */
declare function GetUpdatedEntityID(): EntityID;

/**
 * No documentation from Nolla
 */
declare function GetUpdatedComponentID(): ComponentID;

/**
 * No documentation from Nolla
 */
declare function SetTimeOut(time_to_execute: number, file_to_execute: string, function_to_call?: string): void;

/**
 * No documentation from Nolla
 */
declare function RegisterSpawnFunction(color: number, function_name: string): void;

/**
 * No documentation from Nolla
 */
declare function SpawnActionItem(x: number, y: number, level: number): void;

/**
 * No documentation from Nolla
 */
declare function SpawnStash(x: number, y: number, level: number, action_count: number): EntityID;

/**
 * No documentation from Nolla
 */
declare function SpawnApparition(x: number, y: number, level: number, spawn_now?: boolean): LuaMultiReturn<[number, EntityID]>;

/**
 * No documentation from Nolla
 */
declare function LoadEntityToStash(entity_file: string, stash_entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function AddMaterialInventoryMaterial(entity_id: EntityID, material_name: string, count: number): void;

/**
 * If material_name is empty, all materials will be removed.
 */
declare function RemoveMaterialInventoryMaterial(entity_id: EntityID, material_name?: string): void;

/**
 * Returns the id of the material taking the largest part of the first MaterialInventoryComponent in 'entity_id', or 0 if nothing is found.
 */
declare function GetMaterialInventoryMainMaterial(entity_id: EntityID, ignore_box2d_materials?: boolean): number;

/**
 * No documentation from Nolla
 */
declare function GameScreenshake(strength: number, x?: number, y?: number): void;

/**
 * No documentation from Nolla
 */
declare function GameOnCompleted(): void;

/**
 * No documentation from Nolla
 */
declare function GameGiveAchievement(id: string): void;

/**
 * No documentation from Nolla
 */
declare function GameDoEnding2(): void;

/**
 * x = 0 normal world, -1 is first west world, +1 is first east world, if y < 0 it is sky, if y > 0 it is hell 
 */
declare function GetParallelWorldPosition(world_pos_x: number, world_pos_y: number): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function BiomeMapLoad_KeepPlayer(filename: string, pixel_scenes?: string): void;

/**
 * Deprecated. Might trigger various bugs. Use BiomeMapLoad_KeepPlayer() instead.
 */
declare function BiomeMapLoad(filename: string): void;

/**
 * Can be used to edit biome configs during initialization. See the nightmare mod for an usage example.
 */
declare function BiomeSetValue(filename: string, field_name: string, value: any): void;

/**
 * Can be used to read biome configs. Returns one or many values matching the type or subtypes of the requested field. Reports error and returns nil if the field type is not supported or field was not found.
 */
declare function BiomeGetValue(filename: string, field_name: string): any | null;

/**
 * Can be used to edit biome configs during initialization. See biome_modifiers.lua for an usage example.
 */
declare function BiomeObjectSetValue(filename: string, meta_object_name: string, field_name: string, value: any): void;

/**
 * Can be used to edit biome config MaterialComponents during initialization. Sets the given value in all found VegetationComponent with matching tree_material. See biome_modifiers.lua for an usage example.
 */
declare function BiomeVegetationSetValue(filename: string, material_name: string, field_name: string, value: any): void;

/**
 * Can be used to edit biome config MaterialComponents during initialization. Sets the given value in the first found MaterialComponent with matching material_name. See biome_modifiers.lua for an usage example.
 */
declare function BiomeMaterialSetValue(filename: string, material_name: string, field_name: string, value: any): void;

/**
 * Can be used to read biome config MaterialComponents during initialization. Returns the given value in the first found MaterialComponent with matching material_name. See biome_modifiers.lua for an usage example.
 */
declare function BiomeMaterialGetValue(filename: string, material_name: string, field_name: string): any | null;

/**
 * No documentation from Nolla
 */
declare function GameIsIntroPlaying(): boolean;

/**
 * No documentation from Nolla
 */
declare function GameGetIsGamepadConnected(): boolean;

/**
 * No documentation from Nolla
 */
declare function GameGetWorldStateEntity(): EntityID;

/**
 * No documentation from Nolla
 */
declare function GameGetPlayerStatsEntity(): EntityID;

/**
 * No documentation from Nolla
 */
declare function GameGetOrbCountAllTime(): number;

/**
 * No documentation from Nolla
 */
declare function GameGetOrbCountThisRun(): number;

/**
 * No documentation from Nolla
 */
declare function GameGetOrbCollectedThisRun(orb_id_zero_based: number): boolean;

/**
 * No documentation from Nolla
 */
declare function GameGetOrbCollectedAllTime(orb_id_zero_based: number): boolean;

/**
 * No documentation from Nolla
 */
declare function GameClearOrbsFoundThisRun(): void;

/**
 * Returns the number of orbs, picked or not.
 */
declare function GameGetOrbCountTotal(): number;

/**
 * Converts a numeric material id to the material's strings id.
 */
declare function CellFactory_GetName(material_id: number): string;

/**
 * Returns the id of a material.
 */
declare function CellFactory_GetType(material_name: string): number;

/**
 * Returns the displayed name of a material, or an empty string if 'material_id' is not valid. Might return a text key.
 */
declare function CellFactory_GetUIName(material_id: number): string;

/**
 * No documentation from Nolla
 */
declare function CellFactory_GetAllLiquids(include_statics?: boolean, include_particle_fx_materials?: boolean): string[];

/**
 * No documentation from Nolla
 */
declare function CellFactory_GetAllSands(include_statics?: boolean, include_particle_fx_materials?: boolean): string[];

/**
 * No documentation from Nolla
 */
declare function CellFactory_GetAllGases(include_statics?: boolean, include_particle_fx_materials?: boolean): string[];

/**
 * No documentation from Nolla
 */
declare function CellFactory_GetAllFires(include_statics?: boolean, include_particle_fx_materials?: boolean): string[];

/**
 * No documentation from Nolla
 */
declare function CellFactory_GetAllSolids(include_statics?: boolean, include_particle_fx_materials?: boolean): string[];

/**
 * No documentation from Nolla
 */
declare function CellFactory_GetTags(material_id: number): string[];

/**
 * No documentation from Nolla
 */
declare function CellFactory_HasTag(material_id: number, tag: string): boolean[];

/**
 * No documentation from Nolla
 */
declare function GameGetCameraPos(): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function GameSetCameraPos(x: number, y: number): void;

/**
 * No documentation from Nolla
 */
declare function GameSetCameraFree(is_free: boolean): void;

/**
 * Returns the camera rectangle. This may not be 100% pixel perfect with regards to what you see on the screen. 'x','y' = top left corner of the rectangle.
 */
declare function GameGetCameraBounds(): LuaMultiReturn<[number, number, number, number]>;

/**
 * No documentation from Nolla
 */
declare function GameRegenItemAction(entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function GameRegenItemActionsInContainer(entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function GameRegenItemActionsInPlayer(entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function GameKillInventoryItem(inventory_owner_entity_id: EntityID, item_entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function GamePickUpInventoryItem(who_picks_up_entity_id: EntityID, item_entity_id: EntityID, do_pick_up_effects?: boolean): void;

/**
 * Returns all the inventory items that entity_id has.
 */
declare function GameGetAllInventoryItems(entity_id: EntityID): EntityID[] | null;

/**
 * No documentation from Nolla
 */
declare function GameDropAllItems(entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function GameDropPlayerInventoryItems(entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function GameDestroyInventoryItems(entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function GameIsInventoryOpen(): boolean;

/**
 * No documentation from Nolla
 */
declare function GameTriggerGameOver(): void;

/**
 * No documentation from Nolla
 */
declare function LoadPixelScene(materials_filename: string, colors_filename: string, x: number, y: number, background_file: string, skip_biome_checks?: boolean, skip_edge_textures?: boolean, color_to_material_table?: { [key: string]: string }, background_z_index?: number, load_even_if_duplicate?: boolean): void;

/**
 * No documentation from Nolla
 */
declare function LoadBackgroundSprite(background_file: string, x: number, y: number, background_z_index?: number, check_biome_corners?: boolean): void;

/**
 * NOTE! Removes the pixel scene sprite if the name and position match. Will return true if manages the find and destroy the background sprite
 */
declare function RemovePixelSceneBackgroundSprite(background_file: string, x: number, y: number): boolean;

/**
 * NOTE! Removes pixel scene background sprites inside the given area.
 */
declare function RemovePixelSceneBackgroundSprites(x_min: number, y_min: number, x_max: number, y_max: number): void;

/**
 * No documentation from Nolla
 */
declare function GameCreateCosmeticParticle(material_name: string, x: number, y: number, how_many: number, xvel: number, yvel: number, color?: number, lifetime_min?: number, lifetime_max?: number, force_create?: boolean, draw_front?: boolean, collide_with_grid?: boolean, randomize_velocity?: boolean, gravity_x?: number, gravity_y?: number): void;

/**
 * No documentation from Nolla
 */
declare function GameCreateParticle(material_name: string, x: number, y: number, how_many: number, xvel: number, yvel: number, just_visual: boolean, draw_as_long?: boolean, randomize_velocity?: boolean): void;

/**
 * No documentation from Nolla
 */
declare function GameCreateSpriteForXFrames(filename: string, x: number, y: number, centered?: boolean, sprite_offset_x?: number, sprite_offset_y?: number, frames?: number, emissive?: boolean): void;

/**
 * 'shooter_entity' can be 0. Warning: If 'projectile_entity' has PhysicsBodyComponent and ItemComponent, components without the "enabled_in_world" tag will be disabled, as if the entity was thrown by player.
 */
declare function GameShootProjectile(shooter_entity: number, x: number, y: number, target_x: number, target_y: number, projectile_entity: number, send_message?: boolean, verlet_parent_entity?: number): void;

/**
 * No documentation from Nolla
 */
declare function EntityInflictDamage(entity: number, amount: number, damage_type: string, description: string, ragdoll_fx: string, impulse_x: number, impulse_y: number, entity_who_is_responsible?: number, world_pos_x?: number, world_pos_y?: number, knockback_force?: number): void;

/**
 * Has the same effects that would occur if 'entity' eats 'amount' number of cells of 'material_type' from the game world. Use this instead of directly modifying IngestionComponent values, if possible. Might not work with non-player entities. Use CellFactory_GetType() to convert a material name to material type.
 */
declare function EntityIngestMaterial(entity: number, material_type: number, amount: number): void;

/**
 * No documentation from Nolla
 */
declare function EntityRemoveIngestionStatusEffect(entity: number, status_type_id: string): void;

/**
 * No documentation from Nolla
 */
declare function EntityRemoveStainStatusEffect(entity: number, status_type_id: string, status_cooldown?: number): void;

/**
 * Adds random visible stains of 'material_type' to entity. 'amount' controls the number of stain cells added. Does nothing if 'entity' doesn't have a SpriteStainsComponent. Use CellFactory_GetType() to convert a material name to material type.
 */
declare function EntityAddRandomStains(entity: number, material_type: number, amount: number): void;

/**
 * Modifies DamageModelComponents materials_that_damage and materials_how_much_damage variables (and their parsed out data structures)
 */
declare function EntitySetDamageFromMaterial(entity: number, material_name: string, damage: number): void;

/**
 * Immediately refreshes the given SpriteComponent. Might be useful with text sprites if you want them to update more often than once a second.
 */
declare function EntityRefreshSprite(entity: number, sprite_component: number): void;

/**
 * Returns the capacity of a wand entity, or 0 if 'entity' doesnt exist.
 */
declare function EntityGetWandCapacity(entity: number): number;

/**
 * Returns the position of a hot spot defined by a HotspotComponent. If 'transformed' is true, will return the position in world coordinates, transformed using the entity's transform.
 */
declare function EntityGetHotspot(entity: number, hotspot_tag: string, transformed: boolean, include_disabled_components?: boolean): LuaMultiReturn<[number, number]>;

/**
 * Plays animation. Follow up animation ('followup_name') is applied only if 'followup_priority' is given.
 */
declare function GamePlayAnimation(entity_id: EntityID, name: string, priority: number, followup_name?: string, followup_priority?: number): void;

/**
 * No documentation from Nolla
 */
declare function GameGetVelocityCompVelocity(entity_id: EntityID): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function GameGetGameEffect(entity_id: EntityID, game_effect_name: string): ComponentID;

/**
 * No documentation from Nolla
 */
declare function GameGetGameEffectCount(entity_id: EntityID, game_effect_name: string): number;

/**
 * No documentation from Nolla
 */
declare function LoadGameEffectEntityTo(entity_id: EntityID, game_effect_entity_file: string): EntityID;

/**
 * No documentation from Nolla
 */
declare function GetGameEffectLoadTo(entity_id: EntityID, game_effect_name: string, always_load_new: boolean): LuaMultiReturn<[ComponentID, EntityID]>;

/**
 * Adds the entity to the polymorph random table
 */
declare function PolymorphTableAddEntity(entity_xml: string, is_rare?: boolean, add_only_one_copy?: boolean): void;

/**
 * Removes the entity from the polymorph random table
 */
declare function PolymorphTableRemoveEntity(entity_xml: string, from_common_table?: boolean, from_rare_table?: boolean): void;

/**
 * Returns a list of all the entities in the polymorph random table
 */
declare function PolymorphTableGet(rare_table?: boolean): string[];

/**
 * Set a list of all entities sas the polymorph random table
 */
declare function PolymorphTableSet({table_of_xml_entities}: any, rare_table?: boolean): void;

/**
 * No documentation from Nolla
 */
declare function SetPlayerSpawnLocation(x: number, y: number): void;

/**
 * No documentation from Nolla
 */
declare function UnlockItem(action_id: string): void;

/**
 * No documentation from Nolla
 */
declare function GameGetPotionColorUint(entity_id: EntityID): number;

/**
 * Returns the centroid of first enabled HitboxComponent found in entity, the position of the entity if no hitbox is found, or nil if the entity does not exist. All returned positions are in world coordinates.
 */
declare function EntityGetFirstHitboxCenter(entity_id: EntityID): LuaMultiReturn<[number, number]> | null;

/**
 * Does a raytrace that stops on any cell it hits.
 */
declare function Raytrace(x1: number, y1: number, x2: number, y2: number): LuaMultiReturn<[boolean, number, number]>;

/**
 * Does a raytrace that stops on any cell that is not fluid, gas (yes, technically gas is a fluid), or fire.
 */
declare function RaytraceSurfaces(x1: number, y1: number, x2: number, y2: number): LuaMultiReturn<[boolean, number, number]>;

/**
 * Does a raytrace that stops on any cell that is not gas or fire.
 */
declare function RaytraceSurfacesAndLiquiform(x1: number, y1: number, x2: number, y2: number): LuaMultiReturn<[boolean, number, number]>;

/**
 * Does a raytrace that stops on any cell a character can stand on.
 */
declare function RaytracePlatforms(x1: number, y1: number, x2: number, y2: number): LuaMultiReturn<[boolean, number, number]>;

/**
 * No documentation from Nolla
 */
declare function FindFreePositionForBody(ideal_pos_x: number, idea_pos_y: number, velocity_x: number, velocity_y: number, body_radius: number): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function GetSurfaceNormal(pos_x: number, pos_y: number, ray_length: number, ray_count: number): LuaMultiReturn<[boolean, number, number, number]>;

/**
 * Returns the approximate sky visibility (sky ambient level) at a point as a number between 0 and 1. The value is not affected by weather or time of day. This value is used by the post fx shader after some temporal and spatial smoothing.
 */
declare function GameGetSkyVisibility(pos_x: number, pos_y: number): number;

/**
 * Returns an integer between 0 and 255. Larger value means more coverage. Returns -1 if query is outside the bounds of the fog of war grid. For performance reasons consider using the components that manipulate fog of war.
 */
declare function GameGetFogOfWar(pos_x: number, pos_y: number): number;

/**
 * Returns an integer between 0 and 255. Larger value means more coverage. Returns -1 if query is outside the bounds of the fog of war grid. The value is bilinearly filtered using four samples around 'pos'. For performance reasons consider using the components that manipulate fog of war.
 */
declare function GameGetFogOfWarBilinear(pos_x: number, pos_y: number): number;

/**
 * 'fog_of_war' should be between 0 and 255 (but will be clamped to the correct range with a int32->uint8 cast). Larger value means more coverage. Returns a boolean indicating whether or not the position was inside the bounds of the fog of war grid. For performance reasons consider using the components that manipulate fog of war.
 */
declare function GameSetFogOfWar(pos_x: number, pos_y: number, fog_of_war: number): boolean;

/**
 * Returns true if the area inside the bounding box defined by the parameters has been streamed in and no pixel scenes are loading in the area.
 */
declare function DoesWorldExistAt(min_x: number, min_y: number, max_x: number, max_y: number): boolean;

/**
 * No documentation from Nolla
 */
declare function StringToHerdId(herd_name: string): number;

/**
 * No documentation from Nolla
 */
declare function HerdIdToString(herd_id: number): string;

/**
 * No documentation from Nolla
 */
declare function GetHerdRelation(herd_id_a: number, herd_id_b: number): number;

/**
 * No documentation from Nolla
 */
declare function EntityGetHerdRelation(entity_a: number, entity_b: number): number;

/**
 * does not spam errors, but returns 0 if anything fails
 */
declare function EntityGetHerdRelationSafe(entity_a: number, entity_b: number): number;

/**
 * Deprecated, use GenomeStringToHerdID() and ComponentSetValue2() instead.
 */
declare function GenomeSetHerdId(entity_id: EntityID, new_herd_id: string): void;

/**
 * NOTE: entity_id might be NULL, but pos_x and pos_y could still be valid.
 */
declare function EntityGetClosestWormAttractor(pos_x: number, pos_y: number): LuaMultiReturn<[EntityID, number, number]>;

/**
 * NOTE: entity_id might be NULL, but pos_x and pos_y could still be valid
 */
declare function EntityGetClosestWormDetractor(pos_x: number, pos_y: number): LuaMultiReturn<[EntityID, number, number, number]>;

/**
 * No documentation from Nolla
 */
declare function GamePrint(log_line: string): void;

/**
 * No documentation from Nolla
 */
declare function GamePrintImportant(title: string, description?: string, ui_custom_decoration_file?: string): void;

/**
 * No documentation from Nolla
 */
declare function DEBUG_GetMouseWorld(): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function DEBUG_MARK(x: number, y: number, message?: string, color_r?: number, color_g?: number, color_b?: number): void;

/**
 * No documentation from Nolla
 */
declare function GameGetFrameNum(): number;

/**
 * No documentation from Nolla
 */
declare function GameGetRealWorldTimeSinceStarted(): number;

/**
 * Debugish function - returns if a key is down, does not depend on state. E.g. player could be in menus or inputting text. See data/scripts/debug/keycodes.lua for the constants).
 */
declare function InputIsKeyDown(key_code: number): boolean;

/**
 * Debugish function - returns if a key is down this frame, does not depend on state. E.g. player could be in menus or inputting text. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputIsKeyJustDown(key_code: number): boolean;

/**
 * Debugish function - returns if a key is up this frame, does not depend on state. E.g. player could be in menus or inputting text. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputIsKeyJustUp(key_code: number): boolean;

/**
 * Debugish function - returns raw x, y coordinates of the mouse on screen)
 */
declare function InputGetMousePosOnScreen(): LuaMultiReturn<[number, number]>;

/**
 * Debugish function - returns if mouse button is down. Does not depend on state. E.g. player could be in menus. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputIsMouseButtonDown(mouse_button: number): boolean;

/**
 * Debugish function - returns if mouse button is down. Does not depend on state. E.g. player could be in menus. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputIsMouseButtonJustDown(mouse_button: number): boolean;

/**
 * Debugish function - returns if mouse button is down. Does not depend on state. E.g. player could be in menus. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputIsMouseButtonJustUp(mouse_button: number): boolean;

/**
 * Debugish function - returns if 'joystick' button is down. Does not depend on state. E.g. player could be in menus. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputIsJoystickButtonDown(joystick_index: number, joystick_button: number): boolean;

/**
 * Debugish function - returns if 'joystick' button is just down. Does not depend on state. E.g. player could be in menus. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputIsJoystickButtonJustDown(joystick_index: number, joystick_button: number): boolean;

/**
 * Debugish function - returns analog 'joystick' button value (0-1). analog_button_index 0 = left trigger, 1 = right trigger Does not depend on state. E.g. player could be in menus. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputGetJoystickAnalogButton(joystick_index: number, analog_button_index: number): number;

/**
 * Debugish function - returns true if 'joystick' at that index is connected. Does not depend on state. E.g. player could be in menus. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputIsJoystickConnected(joystick_index: number): boolean;

/**
 * Debugish function - returns analog stick positions (-1,+1). stick_id 0 = left, 1 = right, Does not depend on state. E.g. player could be in menus. See data/scripts/debug/keycodes.lua for the constants)
 */
declare function InputGetJoystickAnalogStick(joystick_index: number, stick_id?: number): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function IsPlayer(entity_id: EntityID): boolean;

/**
 * No documentation from Nolla
 */
declare function IsInvisible(entity_id: EntityID): boolean;

/**
 * No documentation from Nolla
 */
declare function GameIsDailyRun(): boolean;

/**
 * No documentation from Nolla
 */
declare function GameIsDailyRunOrDailyPracticeRun(): boolean;

/**
 * No documentation from Nolla
 */
declare function GameIsModeFullyDeterministic(): boolean;

/**
 * No documentation from Nolla
 */
declare function GlobalsSetValue(key: string, value: string): void;

/**
 * No documentation from Nolla
 */
declare function GlobalsGetValue(key: string, default_value?: string): void;

/**
 * No documentation from Nolla
 */
declare function MagicNumbersGetValue(key: string): string;

/**
 * No documentation from Nolla
 */
declare function SetWorldSeed(new_seed: number): void;

/**
 * No documentation from Nolla
 */
declare function SessionNumbersGetValue(key: string): string;

/**
 * No documentation from Nolla
 */
declare function SessionNumbersSetValue(key: string, value: string): void;

/**
 * No documentation from Nolla
 */
declare function SessionNumbersSave(): void;

/**
 * No documentation from Nolla
 */
declare function AutosaveDisable(): void;

/**
 * No documentation from Nolla
 */
declare function StatsGetValue(key: string): string | null;

/**
 * No documentation from Nolla
 */
declare function StatsGlobalGetValue(key: string): string;

/**
 * No documentation from Nolla
 */
declare function StatsBiomeGetValue(key: string): string;

/**
 * No documentation from Nolla
 */
declare function StatsBiomeReset(): void;

/**
 * No documentation from Nolla
 */
declare function StatsLogPlayerKill(killed_entity_id?: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function CreateItemActionEntity(action_id: string, x?: number, y?: number): EntityID;

/**
 * No documentation from Nolla
 */
declare function GetRandomActionWithType(x: number, y: number, max_level: number, type: number, i?: number): string;

/**
 * No documentation from Nolla
 */
declare function GetRandomAction(x: number, y: number, max_level: number, i?: number): string;

/**
 * No documentation from Nolla
 */
declare function GameGetDateAndTimeUTC(): LuaMultiReturn<[number, number, number, number, number, number]>;

/**
 * No documentation from Nolla
 */
declare function GameGetDateAndTimeLocal(): LuaMultiReturn<[number, number, number, number, number, number]>;

/**
 * No documentation from Nolla
 */
declare function GameEmitRainParticles(num_particles: number, width_outside_camera: number, material_name: string, velocity_min: number, velocity_max: number, gravity: number, droplets_bounce: boolean, draw_as_long: boolean): void;

/**
 * Each beam adds a little overhead to things like chunk creation, so please call this sparingly.
 */
declare function GameCutThroughWorldVertical(x: number, y_min: number, y_max: number, radius: number, edge_darkening_width: number): void;

/**
 * This is available if BIOME_MAP in magic_numbers.xml points to a lua file, in the context of that file.
 */
declare function BiomeMapSetSize(width: number, height: number): void;

/**
 * if BIOME_MAP in magic_numbers.xml points to a lua file returns that context, if not will return the biome_map size
 */
declare function BiomeMapGetSize(): LuaMultiReturn<[number, number]>;

/**
 * This is available if BIOME_MAP in magic_numbers.xml points to a lua file, in the context of that file.
 */
declare function BiomeMapSetPixel(x: number, y: number, color_int: number): void;

/**
 * This is available if BIOME_MAP in magic_numbers.xml points to a lua file, in the context of that file.
 */
declare function BiomeMapGetPixel(x: number, y: number): number;

/**
 * Swaps red and blue channels of 'color'. This can be used make sense of the BiomeMapGetPixel() return values. E.g. if( BiomeMapGetPixel( x, y ) == BiomeMapConvertPixelFromUintToInt( 0xFF36D517 ) ) then print('hills') end 
 */
declare function BiomeMapConvertPixelFromUintToInt(color: number): number;

/**
 * This is available if BIOME_MAP in magic_numbers.xml points to a lua file, in the context of that file.
 */
declare function BiomeMapLoadImage(x: number, y: number, image_filename: string): void;

/**
 * This is available if BIOME_MAP in magic_numbers.xml points to a lua file, in the context of that file.
 */
declare function BiomeMapLoadImageCropped(x: number, y: number, image_filename: string, image_x: number, image_y: number, image_w: number, image_h: number): void;

/**
 * No documentation from Nolla
 */
declare function BiomeMapGetVerticalPositionInsideBiome(x: number, y: number): number;

/**
 * No documentation from Nolla
 */
declare function BiomeMapGetName(x?: number, y?: number): string;

/**
 * No documentation from Nolla
 */
declare function SetRandomSeed(x: number, y: number): void;

/**
 * This is kinda messy. If given 0 arguments, returns number between 0.0 and 1.0. If given 1 arguments, returns int between 0 and 'a'. If given 2 arguments returns int between 'a' and 'b'.
 */
declare function Random(a?: number, b?: number): number | number;

/**
 * This is kinda messy. If given 0 arguments, returns number between 0.0 and 1.0. If given 1 arguments, returns number between 0.0 and 'a'. If given 2 arguments returns number between 'a' and 'b'.
 */
declare function Randomf(min?: number, max?: number): number;

/**
 * No documentation from Nolla
 */
declare function RandomDistribution(min: number, max: number, mean: number, sharpness?: number, baseline?: number): number;

/**
 * No documentation from Nolla
 */
declare function RandomDistributionf(min: number, max: number, mean: number, sharpness?: number, baseline?: number): number;

/**
 * This is kinda messy. If given 2 arguments, returns number between 0.0 and 1.0. If given 3 arguments, returns int between 0 and 'a'. If given 4 arguments returns number between 'a' and 'b'.
 */
declare function ProceduralRandom(x: number, y: number, a?: number | number, b?: number | number): number | number;

/**
 * This is kinda messy. If given 2 arguments, returns number between 0.0 and 1.0. If given 3 arguments, returns a number between 0 and 'a'. If given 4 arguments returns a number between 'a' and 'b'.
 */
declare function ProceduralRandomf(x: number, y: number, a?: number, b?: number): number;

/**
 * This is kinda messy. If given 2 arguments, returns 0 or 1. If given 3 arguments, returns an int between 0 and 'a'. If given 4 arguments returns an int between 'a' and 'b'.
 */
declare function ProceduralRandomi(x: number, y: number, a?: number, b?: number): number;

/**
 * Does not work with PhysicsBody2Component. Returns the id of the created physics body.
 */
declare function PhysicsAddBodyImage(entity_id: EntityID, image_file: string, material?: string, offset_x?: number, offset_y?: number, centered?: boolean, is_circle?: boolean, material_image_file?: string, use_image_as_colors?: boolean): number;

/**
 * Does not work with PhysicsBody2Component. Returns the id of the created physics body.
 */
declare function PhysicsAddBodyCreateBox(entity_id: EntityID, material: string, offset_x: number, offset_y: number, width: number, height: number, centered?: boolean): number | null;

/**
 * Does not work with PhysicsBody2Component. Returns the id of the created joint.
 */
declare function PhysicsAddJoint(entity_id: EntityID, body_id0: number, body_id1: number, offset_x: number, offset_y: number, joint_type: string): number | null;

/**
 * No documentation from Nolla
 */
declare function PhysicsApplyForce(entity_id: EntityID, force_x: number, force_y: number): void;

/**
 * No documentation from Nolla
 */
declare function PhysicsApplyTorque(entity_id: EntityID, torque: number): void;

/**
 * No documentation from Nolla
 */
declare function PhysicsApplyTorqueToComponent(entity_id: EntityID, component_id: ComponentID, torque: number): void;

/**
 * Applies a force calculated by 'calculate_force_for_body_fn' to all bodies in an area. 'calculate_force_for_body_fn' should be a lua function with the following signature: function( body_entity:int, body_mass:number, body_x:number, body_y:number, body_vel_x:number, body_vel_y:number, body_vel_angular:number ) -> force_world_pos_x:number,force_world_pos_y:number,force_x:number,force_y:number,force_angular:number
 */
declare function PhysicsApplyForceOnArea(calculate_force_for_body_fn: unknown, ignore_this_entity: number, area_min_x: number, area_min_y: number, area_max_x: number, area_max_y: number): void;

/**
 * No documentation from Nolla
 */
declare function PhysicsRemoveJoints(world_pos_min_x: number, world_pos_min_y: number, world_pos_max_x: number, world_pos_max_y: number): void;

/**
 * No documentation from Nolla
 */
declare function PhysicsSetStatic(entity_id: EntityID, is_static: boolean): void;

/**
 * No documentation from Nolla
 */
declare function PhysicsGetComponentVelocity(entity_id: EntityID, component_id: ComponentID): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function PhysicsGetComponentAngularVelocity(entity_id: EntityID, component_id: ComponentID): number;

/**
 * NOTE! results are Box2D units. Velocities need to converted with PhysicsVecToGameVec.
 */
declare function PhysicsComponentGetTransform(component_id: ComponentID): LuaMultiReturn<[number, number, number, number, number, number]>;

/**
 * No documentation from Nolla
 */
declare function PhysicsComponentSetTransform(component_id: ComponentID, x: number, y: number, angle: number, vel_x: number, vel_y: number, angular_vel: number): void;

/**
 * NOTE! If component_id is given, will return all the bodies linked to that component. If component_id is not given, will return all the bodies linked to the entity (with joints or through components).
 */
declare function PhysicsBodyIDGetFromEntity(entity_id: EntityID, component_id?: ComponentID): number[];

/**
 * NOTE! returns an array of physics_body_id(s) of all the box2d bodies in the given area. The default coordinates are in game world space. If passing a sixth argument with true, we will assume the coordinates are in box2d units. 
 */
declare function PhysicsBodyIDQueryBodies(world_pos_min_x: number, world_pos_min_y: number, world_pos_max_x: number, world_pos_max_y: number, include_static_bodies?: boolean, are_these_box2d_units?: boolean): number[];

/**
 * NOTE! returns nil, if body was not found. Results are Box2D units. Velocities need to converted with PhysicsVecToGameVec.
 */
declare function PhysicsBodyIDGetTransform(physics_body_id: number): LuaMultiReturn<[null | number, number, number, number, number, number]>;

/**
 * Requires min 3 first parameters.
 */
declare function PhysicsBodyIDSetTransform(physics_body_id: number, x: number, y: number, angle: number, vel_x: number, vel_y: number, angular_vel: number): void;

/**
 * NOTE! force is in box2d units. world_pos_ is game world coordinates. If world_pos is not given will use the objects center as the position of where the force will be applied.],
 */
declare function PhysicsBodyIDApplyForce(physics_body_id: number, force_x: number, force_y: number, world_pos_x?: number, world_pos_y?: number): void;

/**
 * NOTE! impulse is in box2d units. world_pos_ is game world coordinates. If world_pos is not given will use the objects center as the position of where the force will be applied.],
 */
declare function PhysicsBodyIDApplyLinearImpulse(physics_body_id: number, force_x: number, force_y: number, world_pos_x?: number, world_pos_y?: number): void;

/**
 * No documentation from Nolla
 */
declare function PhysicsBodyIDApplyTorque(physics_body_id: number, torque: number): void;

/**
 * NOTE! returns nil, if body was not found. Results are Box2D units. 
 */
declare function PhysicsBodyIDGetWorldCenter(physics_body_id: number): LuaMultiReturn<[number, number]>;

/**
 * NOTE! returns nil, if body was not found. Results are 0-1. 
 */
declare function PhysicsBodyIDGetDamping(physics_body_id: number): LuaMultiReturn<[number, number]>;

/**
 * NOTE! if angular_damping is given will set it as well.
 */
declare function PhysicsBodyIDSetDamping(physics_body_id: number, linear_damping: number, angular_damping?: number): void;

/**
 * NOTE! returns nil, if body was not found. 
 */
declare function PhysicsBodyIDGetGravityScale(physics_body_id: number): number;

/**
 * No documentation from Nolla
 */
declare function PhysicsBodyIDSetGravityScale(physics_body_id: number, gravity_scale: number): void;

/**
 * No documentation from Nolla
 */
declare function PhysicsBodyIDGetBodyAABB(physics_body_id: number): null;

/**
 * No documentation from Nolla
 */
declare function PhysicsBody2InitFromComponents(entity_id: EntityID): void;

/**
 * No documentation from Nolla
 */
declare function PhysicsPosToGamePos(x: number, y?: number): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function GamePosToPhysicsPos(x: number, y?: number): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function PhysicsVecToGameVec(x: number, y?: number): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function GameVecToPhysicsVec(x: number, y?: number): LuaMultiReturn<[number, number]>;

/**
 * No documentation from Nolla
 */
declare function LooseChunk(world_pos_x: number, world_pos_y: number, image_filename: string, max_durability?: number): void;

/**
 * No documentation from Nolla
 */
declare function VerletApplyCircularForce(world_pos_x: number, world_pos_y: number, radius: number, force: number): void;

/**
 * No documentation from Nolla
 */
declare function VerletApplyDirectionalForce(world_pos_x: number, world_pos_y: number, radius: number, force_x: number, force_y: number): void;

/**
 * No documentation from Nolla
 */
declare function AddFlagPersistent(key: string): boolean;

/**
 * No documentation from Nolla
 */
declare function RemoveFlagPersistent(key: string): void;

/**
 * No documentation from Nolla
 */
declare function HasFlagPersistent(key: string): boolean;

/**
 * No documentation from Nolla
 */
declare function GameAddFlagRun(flag: string): void;

/**
 * No documentation from Nolla
 */
declare function GameRemoveFlagRun(flag: string): void;

/**
 * No documentation from Nolla
 */
declare function GameHasFlagRun(flag: string): boolean;

/**
 * No documentation from Nolla
 */
declare function GameTriggerMusicEvent(event_path: string, can_be_faded: boolean, x: number, y: number): void;

/**
 * No documentation from Nolla
 */
declare function GameTriggerMusicCue(name: string): void;

/**
 * No documentation from Nolla
 */
declare function GameTriggerMusicFadeOutAndDequeueAll(relative_fade_speed?: number): void;

/**
 * No documentation from Nolla
 */
declare function GamePlaySound(bank_filename: string, event_path: string, x: number, y: number): void;

/**
 * Plays a sound through all AudioComponents with matching sound in 'entity_id'.
 */
declare function GameEntityPlaySound(entity_id: EntityID, event_name: string): void;

/**
 * Plays a sound loop through an AudioLoopComponent tagged with 'component_tag' in 'entity'. 'intensity' & 'intensity2' affect the intensity parameters passed to the audio event. Must be called every frame when the sound should play.
 */
declare function GameEntityPlaySoundLoop(entity: number, component_tag: string, intensity: number, intensity2?: number): void;

/**
 * Can be used to pass custom parameters to the post_final shader, or override values set by the game code. The shader uniform called 'parameter_name' will be set to the latest given values on this and following frames.
 */
declare function GameSetPostFxParameter(parameter_name: string, x: number, y: number, z: number, w: number): void;

/**
 * Will remove a post_final shader parameter value binding set via game GameSetPostFxParameter().
 */
declare function GameUnsetPostFxParameter(parameter_name: string): void;

/**
 * Can be used to pass 2D textures to the post_final shader. The shader uniform called 'parameter_name' will be set to the latest given value on this and following frames. 'texture_filename' can either point to a file, or a virtual file created using the ModImage API.
If 'update_texture' is true, the texture will be re-uploaded to the GPU (could be useful with dynamic textures, but will incur a heavy performance hit with textures that are loaded from the disk).
Accepted values for 'filtering_mode' and 'wrapping_mode' can be found in 'data/libs/utilities.lua'. Each call with a unique 'parameter_name' will create a separate texture while the parameter is in use, so this should be used with some care. While it's possible to change 'texture_filename' on the fly, if texture size changed, this causes destruction of the old texture and allocating a new one, which can be quite slow.
 */
declare function GameSetPostFxTextureParameter(parameter_name: string, texture_filename: string, filtering_mode: number, wrapping_mode: number, update_texture?: boolean): void;

/**
 * Will remove a post_final shader parameter value binding set via game GameSetPostFxTextureParameter().
 */
declare function GameUnsetPostFxTextureParameter(name: string): void;

/**
 * No documentation from Nolla
 */
declare function GameTextGetTranslatedOrNot(text_or_key: string): string;

/**
 * No documentation from Nolla
 */
declare function GameTextGet(key: string, param0?: string, param1?: string, param2?: string): string;

/**
 * No documentation from Nolla
 */
declare function GuiCreate(): any;

/**
 * No documentation from Nolla
 */
declare function GuiDestroy(gui: any): void;

/**
 * No documentation from Nolla
 */
declare function GuiStartFrame(gui: any): void;

/**
 * Sets the options that apply to widgets during this frame. For 'option' use the values in the GUI_OPTION table in "data/scripts/lib/utilities.lua". Values from consecutive calls will be combined. For example calling this with the values GUI_OPTION.Align_Left and GUI_OPTION.GamepadDefaultWidget will set both options for the next widget. The options will be cleared on next call to GuiStartFrame().
 */
declare function GuiOptionsAdd(gui: any, option: number): void;

/**
 * Sets the options that apply to widgets during this frame. For 'option' use the values in the GUI_OPTION table in "data/scripts/lib/utilities.lua". Values from consecutive calls will be combined. For example calling this with the values GUI_OPTION.Align_Left and GUI_OPTION.GamepadDefaultWidget will set both options for the next widget. The options will be cleared on next call to GuiStartFrame().
 */
declare function GuiOptionsRemove(gui: any, option: number): void;

/**
 * Clears the options that apply to widgets during this frame.
 */
declare function GuiOptionsClear(gui: any): void;

/**
 * Sets the options that apply to the next widget during this frame. For 'option' use the values in the GUI_OPTION table in "data/scripts/lib/utilities.lua". Values from consecutive calls will be combined. For example calling this with the values GUI_OPTION.Align_Left and GUI_OPTION.GamepadDefaultWidget will set both options for the next widget.
 */
declare function GuiOptionsAddForNextWidget(gui: any, option: number): void;

/**
 * Sets the color of the next widget during this frame. Color components should be in the 0-1 range.
 */
declare function GuiColorSetForNextWidget(gui: any, red: number, green: number, blue: number, alpha: number): void;

/**
 * Sets the rendering depth ('z') of the widgets following this call. Larger z = deeper. The z will be set to 0 on the next call to GuiStartFrame(). 
 */
declare function GuiZSet(gui: any, z: number): void;

/**
 * Sets the rendering depth ('z') of the next widget following this call. Larger z = deeper.
 */
declare function GuiZSetForNextWidget(gui: any, z: number): void;

/**
 * Can be used to solve ID conflicts. All ids given to Gui* functions will be hashed with the ids stacked (and hashed together) using GuiIdPush() and GuiIdPop(). The id stack has a max size of 1024, and calls to the function will do nothing if the size is exceeded.
 */
declare function GuiIdPush(gui: any, id: number): void;

/**
 * Pushes the hash of 'str' as a gui id. See GuiIdPush().
 */
declare function GuiIdPushString(gui: any, str: string): void;

/**
 * See GuiIdPush().
 */
declare function GuiIdPop(gui: any): void;

/**
 * Starts a scope where animations initiated using GuiAnimateAlphaFadeIn() etc. will be applied to all widgets.
 */
declare function GuiAnimateBegin(gui: any): void;

/**
 * Ends a scope where animations initiated using GuiAnimateAlphaFadeIn() etc. will be applied to all widgets.
 */
declare function GuiAnimateEnd(gui: any): void;

/**
 * Does an alpha tween animation for all widgets inside a scope set using GuiAnimateBegin() and GuiAnimateEnd().
 */
declare function GuiAnimateAlphaFadeIn(gui: any, id: number, speed: number, step: number, reset: boolean): void;

/**
 * Does a scale tween animation for all widgets inside a scope set using GuiAnimateBegin() and GuiAnimateEnd().
 */
declare function GuiAnimateScaleIn(gui: any, id: number, acceleration: number, reset: boolean): void;

/**
 * No documentation from Nolla
 */
declare function GuiText(gui: any, x: number, y: number, text: string, scale?: number, font?: string, font_is_pixel_font?: boolean): void;

/**
 * Deprecated. Use GuiOptionsAdd() or GuiOptionsAddForNextWidget() with GUI_OPTION.Align_HorizontalCenter and GuiText() instead.
 */
declare function GuiTextCentered(gui: any, x: number, y: number, text: string): void;

/**
 * 'scale' will be used for 'scale_y' if 'scale_y' equals 0.
 */
declare function GuiImage(gui: any, id: number, x: number, y: number, sprite_filename: string, alpha?: number, scale?: number, scale_y?: number, rotation?: number, rect_animation_playback_type?: number, rect_animation_name?: string): void;

/**
 * No documentation from Nolla
 */
declare function GuiImageNinePiece(gui: any, id: number, x: number, y: number, width: number, height: number, alpha?: number, sprite_filename?: string, sprite_highlight_filename?: string): void;

/**
 * The old parameter order where 'id' is the last parameter is still supported. The function dynamically picks the correct order based on the type of the 4th parameter.
 */
declare function GuiButton(gui: any, id: number, x: number, y: number, text: string, scale?: number, font?: string, font_is_pixel_font?: boolean): LuaMultiReturn<[boolean, boolean]>;

/**
 * No documentation from Nolla
 */
declare function GuiImageButton(gui: any, id: number, x: number, y: number, text: string, sprite_filename: string): LuaMultiReturn<[boolean, boolean]>;

/**
 * This is not intended to be outside mod settings menu, and might bug elsewhere.
 */
declare function GuiSlider(gui: any, id: number, x: number, y: number, text: string, value: number, value_min: number, value_max: number, value_default: number, value_display_multiplier: number, value_formatting: string, width: number): number;

/**
 * 'allowed_characters' should consist only of ASCII characters. This is not intended to be outside mod settings menu, and might bug elsewhere.
 */
declare function GuiTextInput(gui: any, id: number, x: number, y: number, text: string, width: number, max_length: number, allowed_characters?: string): string;

/**
 * Together with GuiEndAutoBoxNinePiece() this can be used to draw an auto-scaled background box for a bunch of widgets rendered between the calls.
 */
declare function GuiBeginAutoBox(gui: any): void;

/**
 * No documentation from Nolla
 */
declare function GuiEndAutoBoxNinePiece(gui: any, margin?: number, size_min_x?: number, size_min_y?: number, mirrorize_over_x_axis?: boolean, x_axis?: number, sprite_filename?: string, sprite_highlight_filename?: string): void;

/**
 * No documentation from Nolla
 */
declare function GuiTooltip(gui: any, text: string, description: string): void;

/**
 * This can be used to create a container with a vertical scroll bar. Widgets between GuiBeginScrollContainer() and GuiEndScrollContainer() will be positioned relative to the container.
 */
declare function GuiBeginScrollContainer(gui: any, id: number, x: number, y: number, width: number, height: number, scrollbar_gamepad_focusable?: boolean, margin_x?: number, margin_y?: number): void;

/**
 * No documentation from Nolla
 */
declare function GuiEndScrollContainer(gui: any): void;

/**
 * If 'position_in_ui_scale' is 1, x and y will be in the same scale as other gui positions, otherwise x and y are given as a percentage (0-100) of the gui screen size.
 */
declare function GuiLayoutBeginHorizontal(gui: any, x: number, y: number, position_in_ui_scale?: boolean, margin_x?: number, margin_y?: number): void;

/**
 * If 'position_in_ui_scale' is 1, x and y will be in the same scale as other gui positions, otherwise x and y are given as a percentage (0-100) of the gui screen size.
 */
declare function GuiLayoutBeginVertical(gui: any, x: number, y: number, position_in_ui_scale?: boolean, margin_x?: number, margin_y?: number): void;

/**
 * Will use the horizontal margin from current layout if amount is not set.
 */
declare function GuiLayoutAddHorizontalSpacing(gui: any, amount?: number): void;

/**
 * Will use the vertical margin from current layout if amount is not set.
 */
declare function GuiLayoutAddVerticalSpacing(gui: any, amount?: number): void;

/**
 * No documentation from Nolla
 */
declare function GuiLayoutEnd(gui: any): void;

/**
 * Puts following things to a new layout layer. Can be used to create non-layouted widgets inside a layout.
 */
declare function GuiLayoutBeginLayer(gui: any): void;

/**
 * No documentation from Nolla
 */
declare function GuiLayoutEndLayer(gui: any): void;

/**
 * Returns dimensions of viewport in the gui coordinate system (which is equal to the coordinates of the screen bottom right corner in gui coordinates). The values returned may change depending on the game resolution because the UI is scaled for pixel-perfect text rendering.
 */
declare function GuiGetScreenDimensions(gui: any): LuaMultiReturn<[number, number]>;

/**
 * Returns size of the given text in the gui coordinate system.
 */
declare function GuiGetTextDimensions(gui: any, text: string, scale?: number, line_spacing?: number, font?: string, font_is_pixel_font?: boolean): LuaMultiReturn<[number, number]>;

/**
 * Returns size of the given image in the gui coordinate system.
 */
declare function GuiGetImageDimensions(gui: any, image_filename: string, scale?: number): LuaMultiReturn<[number, number]>;

/**
 * Returns the final position, size etc calculated for a widget. Some values aren't supported by all widgets.
 */
declare function GuiGetPreviousWidgetInfo(gui: any): LuaMultiReturn<[boolean, boolean, boolean, number, number, number, number, number, number, number, number]>;

/**
 * No documentation from Nolla
 */
declare function GameIsBetaBuild(): boolean;

/**
 * No documentation from Nolla
 */
declare function DebugGetIsDevBuild(): boolean;

/**
 * No documentation from Nolla
 */
declare function DebugEnableTrailerMode(): void;

/**
 * No documentation from Nolla
 */
declare function GameGetIsTrailerModeEnabled(): boolean;

/**
 * This doesn't do anything at the moment.
 */
declare function Debug_SaveTestPlayer(): void;

/**
 * No documentation from Nolla
 */
declare function DebugBiomeMapGetFilename(x?: number, y?: number): string;

/**
 * No documentation from Nolla
 */
declare function EntityConvertToMaterial(entity_id: EntityID, material: string, use_material_colors?: boolean, replace_existing_cells?: boolean): void;

/**
 * No documentation from Nolla
 */
declare function ConvertEverythingToGold(material_dynamic?: string, material_static?: string): void;

/**
 * Converts 'material_from' to 'material_to' everwhere in the game world, replaces 'material_from_type' to 'material_to_type' in the material (CellData) global table, and marks 'material_from' as a "Transformed" material. Every call will add a new entry to WorldStateComponent which serializes these changes, so please call sparingly. The material conversion will be spread over multiple frames. 'material_from' will still retain the original name id and wang color. Use CellFactory_GetType() to convert a material name to material type.
 */
declare function ConvertMaterialEverywhere(material_from_type: number, material_to_type: number): void;

/**
 * Converts cells of 'material_from_type' to 'material_to_type' in the given area. If 'box2d_trim' is true, will attempt to trim the created cells where they might otherwise cause physics glitching. 'update_edge_graphics_dummy' is not yet supported.
 */
declare function ConvertMaterialOnAreaInstantly(area_x: number, area_y: number, area_w: number, area_h: number, material_from_type: number, material_to_type: number, trim_box2d: boolean, update_edge_graphics_dummy: boolean): void;

/**
 * Loads a given .txt file as a ragdoll into the game, made of the material given in material.
 */
declare function LoadRagdoll(filename: string, pos_x: number, pos_y: number, material?: string, scale_x?: number, impulse_x?: number, impulse_y?: number): void;

/**
 * No documentation from Nolla
 */
declare function GetDailyPracticeRunSeed(): number;

/**
 * Returns true if a mod with the id 'mod_id' is currently active. For example mod_id = "nightmare". 
 */
declare function ModIsEnabled(mod_id: string): boolean;

/**
 * Returns a table filled with the IDs of currently active mods.
 */
declare function ModGetActiveModIDs(): string[];

/**
 * No documentation from Nolla
 */
declare function ModGetAPIVersion(): number;

/**
 * Returns true if the file exists.
 */
declare function ModDoesFileExist(filename: string): boolean;

/**
 * Returns a list of filenames from which materials were loaded.
 */
declare function ModMaterialFilesGet(): string[];

/**
 * Returns the value of a mod setting. 'id' should normally be in the format 'mod_name.setting_id'. Cache the returned value in your lua context if possible.
 */
declare function ModSettingGet(id: string): boolean | number | string | null;

/**
 * Sets the value of a mod setting. 'id' should normally be in the format 'mod_name.setting_id'.
 */
declare function ModSettingSet(id: string, value: boolean | number | string): void;

/**
 * Returns the latest value set by the user, which might not be equal to the value that is used in the game (depending on the 'scope' value selected for the setting).
 */
declare function ModSettingGetNextValue(id: string): boolean | number | string | null;

/**
 * Sets the latest value set by the user, which might not be equal to the value that is displayed to the game (depending on the 'scope' value selected for the setting).
 */
declare function ModSettingSetNextValue(id: string, value: boolean | number | string, is_default: boolean): void;

/**
 * No documentation from Nolla
 */
declare function ModSettingRemove(id: string): boolean;

/**
 * Returns the number of mod settings defined. Use ModSettingGetAtIndex to enumerate the settings.
 */
declare function ModSettingGetCount(): number;

/**
 * 'index' should be 0-based index. Returns nil if 'index' is invalid.
 */
declare function ModSettingGetAtIndex(index: number): LuaMultiReturn<[string, boolean | number | string | null, boolean | number | string | null]> | null;

/**
 * No documentation from Nolla
 */
declare function StreamingGetIsConnected(): boolean;

/**
 * No documentation from Nolla
 */
declare function StreamingGetConnectedChannelName(): string;

/**
 * No documentation from Nolla
 */
declare function StreamingGetVotingCycleDurationFrames(): number;

/**
 * Returns the name of a random stream viewer who recently sent a chat message. Returns "" if the 'Creatures can be named after viewers' setting is off.
 */
declare function StreamingGetRandomViewerName(): string;

/**
 * No documentation from Nolla
 */
declare function StreamingGetSettingsGhostsNamedAfterViewers(): boolean;

/**
 * Sets the duration of the next wait and voting phases. Use -1 for default duration.
 */
declare function StreamingSetCustomPhaseDurations(time_between_votes_seconds: number, time_voting_seconds: number): void;

/**
 * Cancels whatever is currently going on, and starts a new voting. _streaming_on_vote_start() and _streaming_get_event_for_vote() will be called as usually.
 */
declare function StreamingForceNewVoting(): void;

/**
 * Turns the voting UI on or off.
 */
declare function StreamingSetVotingEnabled(enabled: boolean): void;

/**
 * Basically calls dofile(from_filename) at the end of 'to_filename'. Available only in init.lua. Should not be called after OnMostPostInit(should be avoided after that because changes might not propagate, or could work in non-deterministic manner).
 */
declare function ModLuaFileAppend(to_filename: string, from_filename: string): void;

/**
 * Returns the paths of files that have been appended to 'filename' using ModLuaFileAppend(). Unlike most Mod* functions, this one is available everywhere.
 */
declare function ModLuaFileGetAppends(filename: string): string[];

/**
 * Replaces the appends list (see ModLuaFileAppend) of a file with the given table. Available only in init.lua. Should not be called after OnMostPostInit(should be avoided after that because changes might not propagate, or could work in non-deterministic manner).
 */
declare function ModLuaFileSetAppends(filename: string, {string}: any): void;

/**
 * Returns the current (modded or not) content of the data file 'filename'. Allows access only to data files and files from enabled mods. "mods/mod/data/file.xml" and "data/file.xml" point to the same file. Unlike most Mod* functions, this one is available everywhere.
 */
declare function ModTextFileGetContent(filename: string): string;

/**
 * Sets the content the game sees for the file 'filename'. Allows access only to mod and data files. "mods/mod/data/file.xml" and "data/file.xml" point to the same file. Available only in init.lua. Should not be called after OnMostPostInit (should be avoided after that because changes might not propagate, or could work in non-deterministic manner). ModTextFileWhoSetContent might also return incorrect values if this is used after OnMostPostInit.
 */
declare function ModTextFileSetContent(filename: string, new_content: string): void;

/**
 * Returns the id of the last mod that called ModTextFileSetContent with 'filename', or "". Unlike most Mod* functions, this one is available everywhere.
 */
declare function ModTextFileWhoSetContent(filename: string): string;

/**
 * Makes an image available for in-memory editing through ModImageGetPixel() and ModImageSetPixel(). 
Returns an id that can be used to access the image, and the dimensions of the image. 
If an image file with the name wasn't found, an in-memory image of the given size will be created, filled with empty pixels (0x0), and added to the virtual filesystem under 'filename'. 
If an image with the given name has been previously created through ModImageMakeEditable, the id of that image will be returned. In case memory allocation failed, or if this is called outside mod init using a filename that wasn't succesfully used with this function during the init, 0 will be returned as the id. 
The game will apply further processing to some images, so the final binary data might end up different. For example, R and B channels are sometimes swapped, and on some textures the colors will be extended by one pixel outside areas where A>0. 
If game code has already loaded the image (for example this could be the case with some UI textures), the changes will probably not be applied. 
The changes done using the ModImage* API will need to be done again on each game restart/new game. It's possible that some images will be cached over restarts, and changes will not be visible in the game until a full executable restart - you will have to figure out where that applies. 
Allows access to data files and files from enabled mods. "mods/mod/data/file.png" and "data/file.png" point to the same file. Available only in init.lua during mod init. 
 */
declare function ModImageMakeEditable(filename: string, width: number, height: number): LuaMultiReturn<[number, number, number]>;

/**
 * Returns an id that can be used with ModImageGetPixel and ModImageSetPixel, and the dimensions of the image. 
 If a previous successful call to ModImageMakeEditable hasn't been made with the given filename, 0 will be returned as 'id', 'w' and 'h'. 
Unlike most Mod* functions, this one is available everywhere.
 */
declare function ModImageIdFromFilename(filename: string): LuaMultiReturn<[number, number, number]>;

/**
 * Returns the color of a pixel in ABGR format (0xABGR). 'x' and 'y' are zero-based. 
Use ModImageMakeEditable to create an id that can be used with this function. 
 While it's possible to edit images after mod init, it's not guaranteed that game systems will see the changes, as the system might already have loaded the image at that point. 
The function will silently fail nad return 0 if 'id' isn't valid. 
Unlike most Mod* functions, this one is available everywhere.
 */
declare function ModImageGetPixel(id: number, x: number, y: number): number;

/**
 * Sets the color of a pixel in ABGR format (0xABGR). 'x' and 'y' are zero-based. 
Use ModImageMakeEditable to create an id that can be used with this function. 
 The function will silently fail if 'id' isn't valid. 
Unlike most Mod* functions, this one is available everywhere.
 */
declare function ModImageSetPixel(id: number, x: number, y: number, color: number): void;

/**
 * Returns the id of the last mod that called ModImageMakeEditable with 'filename', or "". Unlike most Mod* functions, this one is available everywhere.
 */
declare function ModImageWhoSetContent(filename: string): string;

/**
 * Returns true if a file or virtual image exists for the given filename. Unlike most Mod* functions, this one is available everywhere.
 */
declare function ModImageDoesExist(filename: string): boolean;

/**
 * Available only during mod initialization in init.lua.
 */
declare function ModMagicNumbersFileAdd(filename: string): void;

/**
 * Available only during mod initialization in init.lua.
 */
declare function ModMaterialsFileAdd(filename: string): void;

/**
 * Registers custom fmod events. Needs to be called to make the game find events in mods' audio banks. Event mapping (GUID) files can be generated using FMOD Studio. Available only during mod initialization in init.lua.
 */
declare function ModRegisterAudioEventMappings(filename: string): void;

/**
 * Registers a custom bank in the music system. After that the tracks can be configured to play through Biome xml, or using GameTriggerMusicEvent. ModRegisterAudioEventMappings also needs to be called to make the game recognize the events in the bank. Available only during mod initialization in init.lua.
 */
declare function ModRegisterMusicBank(filename: string): void;

/**
 * Please supply a path starting with "mods/YOUR_MOD_HERE/" or "data/". If override_existing is true, will always generate new maps, overriding existing files. UV maps are generated when you start or continue a game with your mod enabled. Available only during mod initialization in init.lua via noita_dev.exe
 */
declare function ModDevGenerateSpriteUVsForDirectory(directory_path: string, override_existing?: boolean): void;

/**
 * No documentation from Nolla
 */
declare function RegisterProjectile(entity_filename: string): void;

/**
 * No documentation from Nolla
 */
declare function RegisterGunAction(): void;

/**
 * No documentation from Nolla
 */
declare function RegisterGunShotEffects(): void;

/**
 * No documentation from Nolla
 */
declare function BeginProjectile(entity_filename: string): void;

/**
 * No documentation from Nolla
 */
declare function EndProjectile(): void;

/**
 * No documentation from Nolla
 */
declare function BeginTriggerTimer(timeout_frames: number): void;

/**
 * No documentation from Nolla
 */
declare function BeginTriggerHitWorld(): void;

/**
 * No documentation from Nolla
 */
declare function BeginTriggerDeath(): void;

/**
 * No documentation from Nolla
 */
declare function EndTrigger(): void;

/**
 * No documentation from Nolla
 */
declare function SetProjectileConfigs(): void;

/**
 * No documentation from Nolla
 */
declare function StartReload(reload_time: number): void;

/**
 * No documentation from Nolla
 */
declare function ActionUsesRemainingChanged(inventoryitem_id: number, uses_remaining: number): boolean;

/**
 * No documentation from Nolla
 */
declare function ActionUsed(inventoryitem_id: number): void;

/**
 * No documentation from Nolla
 */
declare function LogAction(action_name: string): void;

/**
 * No documentation from Nolla
 */
declare function OnActionPlayed(action_id: string): void;

/**
 * No documentation from Nolla
 */
declare function OnNotEnoughManaForAction(): void;

/**
 * No documentation from Nolla
 */
declare function BaabInstruction(name: string): void;

/**
 * No documentation from Nolla
 */
declare function SetValueNumber(key: string, value: number): void;

/**
 * No documentation from Nolla
 */
declare function GetValueNumber(key: string, default_value: number): number;

/**
 * No documentation from Nolla
 */
declare function SetValueInteger(key: string, value: number): void;

/**
 * No documentation from Nolla
 */
declare function GetValueInteger(key: string, default_value: number): number;

/**
 * No documentation from Nolla
 */
declare function SetValueBool(key: string, value: number): void;

/**
 * No documentation from Nolla
 */
declare function GetValueBool(key: string, default_value: number): boolean;

/**
 * Returns the script's return value, if any. Returns nil,error_string if the script had errors.
 */
declare function dofile(filename: string): null | any | LuaMultiReturn<[null, string]>;

/**
 * Runs the script only once per lua context, returns the script's return value, if any. Returns nil,error_string if the script had errors. For performance reasons it is recommended scripts use dofile_once(), unless the standard dofile behaviour is required.
 */
declare function dofile_once(filename: string): null | any | LuaMultiReturn<[null, string]>;

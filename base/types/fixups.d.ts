/** @noSelfInFile */

/// <reference path="./magic-numbers.d.ts" />

declare function EntityAddChild(parent_id: EntityID, child_id: EntityID): void;

/**
 * A string union of component field names for given component id `C`
 * (if it's a Component<"ComponentName">, otherwise its just string),
 * that is also filtered by whether the fields extend `F`.
 */
type ComponentField<C extends ComponentID, F = any> =
  C extends Component<infer N>
    ? keyof {
        [K in keyof ComponentShapes[N] as ComponentShapes[N][K] extends F
          ? K
          : never]: any;
      }
    : string;

type ComponentValue<C extends ComponentID, K> =
  C extends Component<infer N>
    ? K extends keyof ComponentShapes[N]
      ? ComponentShapes[N][K]
      : unknown
    : unknown;

/** @deprecated Use EntityAddComponent2 instead */
declare function EntityAddComponent<N extends ComponentName>(
  entity_id: EntityID,
  component_type_name: N,
  values?: (keyof ComponentShapes[N] | (string & {}))[],
): ComponentID;

declare function EntityAddComponent2<N extends ComponentName>(
  entity_id: EntityID,
  component_type_name: N,
  values: Partial<ComponentShapes[N]> & { _enabled?: boolean; _tags?: string },
): ComponentID;

/** @deprecated Use ComponentGetValue2 instead */
declare function ComponentGetValue<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
>(component: C, variable_name: ComponentField<C, string>): string | undefined;

/** @deprecated Use ComponentGetValue2 instead */
declare function ComponentGetValueBool<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
>(component: C, variable_name: ComponentField<C, boolean>): boolean | undefined;

/** @deprecated Use ComponentGetValue2 instead */
declare function ComponentGetValueInt<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
>(component: C, variable_name: ComponentField<C, number>): number | undefined;

/** @deprecated Use ComponentGetValue2 instead */
declare function ComponentGetValueFloat<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
>(component: C, variable_name: ComponentField<C, number>): number | undefined;

/** @deprecated Use ComponentGetValue2 instead */
declare function ComponentGetValueVector2<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
>(
  component: C,
  variable_name: ComponentField<C, [number, number]>,
): LuaMultiReturn<[number, number]> | LuaMultiReturn<[undefined | undefined]>;

declare function ComponentGetValue2<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
  V extends ComponentField<C>,
>(component: C, variable_name: V): ComponentValue<C, V>;

/** @deprecated Use ComponentSetValue2 instead */
declare function ComponentSetValue<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
>(component: C, variable_name: ComponentField<C>, value: string): void;

declare function ComponentSetValue2<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
  V extends ComponentField<C>,
>(component: C, field_name: V, value: ComponentValue<C, V>): void;

declare function ComponentGetTypeName(component_id: ComponentID): ComponentName;

type VectorItems = {
  int: number;
  float: number;
  string: string;
};

type VectorType = keyof VectorItems;

declare function ComponentGetVectorSize(
  component_id: ComponentID,
  array_member_name: string,
  type_stored_in_vector: VectorType,
): number;

declare function ComponentGetVectorValue<T extends VectorType>(
  component_id: ComponentID,
  array_name: string,
  type_stored_in_vector: T,
  index: number,
): VectorItems[T] | undefined;

declare function ComponentGetVector<T extends VectorType>(
  component_id: ComponentID,
  array_name: string,
  type_stored_in_vector: T,
): VectorItems[T][] | undefined;

declare function EntityGetComponent<N extends ComponentName>(
  entity_id: EntityID,
  component_type_name: N,
  tag?: string,
): Component<N>[] | undefined;

declare function EntityGetComponentIncludingDisabled<N extends ComponentName>(
  entity_id: EntityID,
  component_type_name: N,
  tag?: string,
): Component<N>[] | undefined;

declare function EntityGetFirstComponent<N extends ComponentName>(
  entity_id: EntityID,
  component_type_name: N,
  tag?: string,
): Component<N> | undefined;

declare function EntityGetFirstComponentIncludingDisabled<
  N extends ComponentName,
>(
  entity_id: EntityID,
  component_type_name: N,
  tag?: string,
): Component<N> | undefined;

/**
 * Returns a list of component ids.
 */
declare function EntityGetAllComponents(entity_id: EntityID): ComponentID[];

/**
 * Gets the value of a Noita lua_global variable.
 * They exist as part of the WorldStateComponent, so they are persisted per-world.
 * If the variable doesn't exist, it returns `default_value` if provided, otherwise an empty string.
 */
declare function GlobalsGetValue(key: string, default_value?: string): string;

/**
 * Get one of the magic numbers that control various aspects of the game.
 * They can be set by xml files via `ModMagicNumbersFileAdd`.
 */
declare function MagicNumbersGetValue(key: Suggest<MagicNumbers>): string;

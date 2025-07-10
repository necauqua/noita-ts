/** @noSelfInFile */

type VectorItems = {
  int: number;
  float: number;
  string: string;
};

type VectorType = keyof VectorItems;

declare function ComponentGetTypeName(component_id: ComponentID): ComponentName;

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

declare function EntityGetFirstComponent<N extends ComponentName>(
  entity_id: EntityID,
  component_type_name: N,
  tag?: string,
): Component<N> | undefined;

type ComponentKey<C extends ComponentID> =
  C extends Component<infer N> ? keyof ComponentShapes[N] : string;

type ComponentValue<C extends ComponentID, K> =
  C extends Component<infer N>
    ? K extends keyof ComponentShapes[N]
      ? ComponentShapes[N][K]
      : unknown
    : unknown;

declare function ComponentGetValue2<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
  V extends ComponentKey<C>,
>(component_id: C, variable_name: V): ComponentValue<C, V>;

type VectorType = "int" | "float" | "string";
type VectorItem<T extends VectorType> = {
  int: number;
  float: number;
  string: string;
}[T];

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
): VectorItem<T> | null;

declare function ComponentGetVector<T extends VectorType>(
  component_id: ComponentID,
  array_name: string,
  type_stored_in_vector: T,
): VectorItem<T>[] | null;

declare function EntityGetFirstComponentTest<N extends ComponentName>(
  entity_id: EntityID,
  component_type_name: N,
  tag?: string,
): Component<N> | null;

type ComponentKey<C extends ComponentID> =
  C extends Component<infer N> ? keyof ComponentShapes[N] : string;

type ComponentValue<C extends ComponentID, K> =
  C extends Component<infer N>
    ? K extends ComponentKey<C>
      ? ComponentShapes[N][K]
      : any
    : any;

declare function ComponentGetValue2Test<
  N extends ComponentName,
  C extends ComponentID | Component<N>,
>(
  component_id: C,
  variable_name: ComponentKey<typeof component_id>,
): ComponentValue<typeof component_id, typeof variable_name> | null;

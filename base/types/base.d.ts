declare namespace tags {
  const EntityID: unique symbol;
  const ComponentID: unique symbol;
  const GuiID: unique symbol;
  const ComponentName: unique symbol;
}

type EntityID = number & { readonly [tags.EntityID]: unique symbol };
type ComponentID = number & {
  readonly [tags.ComponentID]: unique symbol;
};
type GuiID = number & { readonly [tags.GuiID]: unique symbol };

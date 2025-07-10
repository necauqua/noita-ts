/// <reference path="./generated/lua_api.d.ts" />
/// <reference path="./generated/components.d.ts" />
/// <reference path="./fixups.d.ts" />

/** @noSelfInFile */

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
type Component<Name extends ComponentName> = ComponentID & {
  readonly [tags.ComponentName]: Name;
};

type ComponentName = keyof ComponentShapes;

interface ComponentTypeMap {
  EntityID: EntityID;
  [x: string]: unknown;
}

/**
 * A Noita analog of `print` which has a higher chance of actually being printed in the console.
 */
declare function print_error(...args: any[]): void;

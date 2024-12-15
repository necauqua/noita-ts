/// <reference path="./generated/lua_api.d.ts" />
/// <reference path="./generated/components.ts" />
/// <reference path="./fixups.d.ts" />

/** @noSelfInFile */

declare namespace tags {
  const EntityID: unique symbol;
  const ComponentID: unique symbol;
  const ComponentName: unique symbol;
}
declare type EntityID = number & { readonly [tags.EntityID]: unique symbol };
declare type ComponentID = number & {
  readonly [tags.ComponentID]: unique symbol;
};
declare type Component<Name extends ComponentName> = ComponentID & {
  readonly [tags.ComponentName]: Name;
};

declare type ComponentName = keyof ComponentShapes;

declare interface ComponentTypeMap {
  EntityID: EntityID;
  [x: string]: unknown;
}

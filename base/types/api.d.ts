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

type ComponentName = keyof ComponentShapes;

type Component<Name extends ComponentName> = ComponentID & {
  readonly [tags.ComponentName]: Name;
};

interface ComponentTypeMap {
  EntityID: EntityID;
  [x: string]: unknown;
}

/**
 * A Noita analog of `print` which has a higher chance of actually being
 * printed in the ~~console~~ noita/logger.txt file.
 */
declare function print_error(...args: any[]): void;

/**
 * Synthetic module to provide build-time information.
 */
declare module "$mod" {
  /** The mod ID as set in package.json (and then propagated to mod.xml, mod_id.txt and this) */
  export const MOD_ID: string;

  /** Set to true when doing `nts run` or `nts build --dev` */
  export const DEV: boolean;
}

/**
 * Noita-TS allows importing arbitrary lua code (including vanilla with `data/` prefix or other mods with `mods/<modid>/`).
 *
 * You can do `import * as utilities from 'data/scripts/lib/utilities.lua';`
 * and the globals defined in `utilities.lua` will be available as properties of `utilities: any`.
 */
declare module "*.lua" {
  const content: any;
  export = content;
}

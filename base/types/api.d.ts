/// <reference path="./base.d.ts" />
/// <reference path="./base-lua.d.ts" />
/// <reference path="./generated/lua_api.d.ts" />
/// <reference path="./generated/components.d.ts" />
/// <reference path="./fixups.d.ts" />
/// <reference path="./settings.d.ts" />
/// <reference path="./util.d.ts" />

/** @noSelfInFile */

type ComponentName = keyof ComponentShapes;

type Component<Name extends ComponentName> = ComponentID & {
  readonly [tags.ComponentName]: Name;
};

/**
 * The TypeScript types of component field types, by the name that the component
 * documentation gives them.
 *
 * A tuple stands for a field that `ComponentGetValue2` gives as several values
 * and `ComponentSetValue2` takes as several arguments; `EntityAddComponent2`
 * cannot set such fields.
 */
interface ComponentTypeMap {
  EntityID: EntityID;
  vec2: [x: number, y: number];
  ivec2: [x: number, y: number];
  ValueRange: [min: number, max: number];
  ValueRangeInt: [min: number, max: number];
  ["types::aabb"]: [min_x: number, min_y: number, max_x: number, max_y: number];
  ["types::iaabb"]: [min_x: number, min_y: number, max_x: number, max_y: number];
  ["types::fcolor"]: [r: number, g: number, b: number, a: number];
  ["types::xform"]: [
    x: number,
    y: number,
    scale_x: number,
    scale_y: number,
    rotation: number,
  ];
  ["LensValue<float>"]: number;
  ["std::vector<int>"]: number[];
  ["std::vector<float>"]: number[];
  [x: string]: unknown;
}

type ComponentNxmlShapes = {
  [C in keyof ComponentShapes]: ComponentShapes[C] & {
    _enabled?: boolean;
    _tags?: string;
  };
};

/**
 * Extend NXML shapes with documented components
 */
declare interface NxmlShapes extends ComponentNxmlShapes {}

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

  /** Set to true when doing `nts test`, i.e. when the mod runs the test suite in a container */
  export const TEST: boolean;
}

/**
 * Noita-TS allows importing arbitrary lua code (including vanilla with `data/` prefix or other mods with `mods/<modid>/`).
 *
 * You can do `import * as utilities from 'data/scripts/lib/utilities.lua';`
 * and the globals defined in `utilities.lua` will be available as properties of `utilities: any`.
 */
declare module "*.lua";

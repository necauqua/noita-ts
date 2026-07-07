/** @noSelfInFile */

import { MOD_ID } from "$mod";

namespace mod {
  export type NoitaEvent = {
    /** This is the first moment during mod initialisation from which the CellFactory_* functions can be called. */
    BiomeConfigLoaded(this: void): void;

    /** The first number to return is the total and the second is the number of secrets found. */
    OnCountSecrets(this: void): LuaMultiReturn<[number, number]>;

    MagicNumbersAndWorldSeedInitialized(this: void): void;

    /** Called once for each mod. It is done for every mod after OnModPreInit and before OnModPostInit is called. */
    ModInit(this: void): void;

    /** Called once for each mod. It is done for every mod after OnModPreInit and OnModInit are called. */
    ModPostInit(this: void): void;

    /**
     * Will be called when the game is unpaused, if player changed any mod settings while the game was paused. Does not get called when ModSettingSet is called.
     *
     * Note: This callback doesn't appear to work. Modders have resorted to using OnPausedChanged instead to detect potential settings changes.
     */
    ModSettingsChanged(this: void): void;

    /** Called once for each mod. It is done for every mod before either OnModInit and OnModPostInit is called. */
    ModPreInit(this: void): void;

    /** Will be called when the game is paused, either by the pause menu or some inventory menus. Please be careful with this, as not everything will behave well when called while the game is paused. */
    PausePreUpdate(this: void): void;

    PausedChanged(
      this: void,
      is_paused: boolean,
      is_inventory_pause: boolean,
    ): void;

    /** Run when the player dies. The parameter passed in is the player_entity ID number. It is also run when starting a new game in the same session.*/
    PlayerDied(this: void, player_entity: EntityID): void;

    /** Run whenever the game spawns the player entity. The parameter passed in is the player_entity ID number. It runs each time either a new game is started, or whenever it's loaded.*/
    PlayerSpawned(this: void, player_entity: EntityID): void;

    /** Run whenever the game creates/loads a new world. Despite the name, OnWorldPreUpdate and OnWorldPostUpdate will still be called at least once before OnWorldInitialized is called. */
    WorldInitialized(this: void): void;

    /** This is called every time the game has finished updating the world */
    WorldPostUpdate(this: void): void;

    /** This is called every time the game is about to start updating the world */
    WorldPreUpdate(this: void): void;
  };

  /**
   * A helper typesafe function to register standard Noita mod hooks.
   */
  export function on<T extends keyof NoitaEvent>(name: T, cb: NoitaEvent[T]) {
    (globalThis as any)[`On${name}`] = cb;
  }

  /**
   * A typesafe interface for ModSettingGet/ModSettingSet.
   * Check out `settings.ts` from the mod template for more info.
   */
  export const settings: SettingsShape &
    Record<string, string | number | boolean | undefined> = setmetatable(
    {},
    {
      __metatable: {}, // freeze it
      __index(name: string) {
        return ModSettingGet(`${MOD_ID}.${name}`);
      },
      __newindex(name: string, value) {
        if (value !== undefined) {
          ModSettingSet(`${MOD_ID}.${name}`, value);
        } else {
          ModSettingRemove(`${MOD_ID}.${name}`);
        }
      },
    },
  ) as any;
}

declare global {
  interface SettingsShape {}
}

export default mod;

/**
 * Hoisted from data/scripts/lib/utilities.lua for ease of use from TypeScript.
 */
export enum GuiOption {
  None = 0,

  // you might not want to use this, because there will be various corner cases and bugs, but feel free to try anyway.
  IsDraggable = 1,

  // works with GuiButton
  NonInteractive = 2,

  AlwaysClickable = 3,
  ClickCancelsDoubleClick = 4,
  IgnoreContainer = 5,
  NoPositionTween = 6,
  ForceFocusable = 7,
  HandleDoubleClickAsClick = 8,

  // it's recommended you use this to communicate the widget where gamepad input will focus when entering a new menu
  GamepadDefaultWidget = 9,

  // these work as intended (mostly)
  Layout_InsertOutsideLeft = 10,
  Layout_InsertOutsideRight = 11,
  Layout_InsertOutsideAbove = 12,
  Layout_ForceCalculate = 13,
  Layout_NextSameLine = 14,
  Layout_NoLayouting = 15,

  // these work as intended (mostly)
  Align_HorizontalCenter = 16,
  Align_Left = 17,

  FocusSnapToRightEdge = 18,

  NoPixelSnapY = 19,

  DrawAlwaysVisible = 20,
  DrawNoHoverAnimation = 21,
  DrawWobble = 22,
  DrawFadeIn = 23,
  DrawScaleIn = 24,
  DrawWaveAnimateOpacity = 25,
  DrawSemiTransparent = 26,
  DrawActiveWidgetCursorOnBothSides = 27,
  DrawActiveWidgetCursorOff = 28,

  TextRichRendering = 29,

  NoSound = 47,
  Hack_ForceClick = 48,
  Hack_AllowDuplicateIds = 49,

  ScrollContainer_Smooth = 50,
  IsExtraDraggable = 51,

  _SnapToCenter = 62,
  Disabled = 63,
}

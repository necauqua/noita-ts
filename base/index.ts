type NoitaHooks = {
  /** This is the first moment during mod initialisation from which the CellFactory_* functions can be called. */
  BiomeConfigLoaded(): void;

  /** The first number to return is the total and the second is the number of secrets found. */
  OnCountSecrets(): LuaMultiReturn<[number, number]>;

  MagicNumbersAndWorldSeedInitialized(): void;

  /** Called once for each mod. It is done for every mod after OnModPreInit and before OnModPostInit is called. */
  ModInit(): void;

  /** Called once for each mod. It is done for every mod after OnModPreInit and OnModInit are called. */
  ModPostInit(): void;

  /**
   * Will be called when the game is unpaused, if player changed any mod settings while the game was paused. Does not get called when ModSettingSet is called.
   *
   * Note: This callback doesn't appear to work. Modders have resorted to using OnPausedChanged instead to detect potential settings changes.
   */
  ModSettingsChanged(): void;

  /** Called once for each mod. It is done for every mod before either OnModInit and OnModPostInit is called. */
  ModPreInit(): void;

  /** Will be called when the game is paused, either by the pause menu or some inventory menus. Please be careful with this, as not everything will behave well when called while the game is paused. */
  PausePreUpdate(): void;

  PausedChanged(is_paused: boolean, is_inventory_pause: boolean): void;

  /** Run when the player dies. The parameter passed in is the player_entity ID number. It is also run when starting a new game in the same session.*/
  PlayerDied(player_entity: EntityID): void;

  /** Run whenever the game spawns the player entity. The parameter passed in is the player_entity ID number. It runs each time either a new game is started, or whenever it's loaded.*/
  PlayerSpawned(player_entity: EntityID): void;

  /** Run whenever the game creates/loads a new world. Despite the name, OnWorldPreUpdate and OnWorldPostUpdate will still be called at least once before OnWorldInitialized is called. */
  WorldInitialized(): void;

  /** This is called every time the game has finished updating the world */
  WorldPostUpdate(): void;

  /** This is called every time the game is about to start updating the world */
  WorldPreUpdate(): void;
};

/**
 * A helper typesafe function to register standard Noita mod hooks.
 * @noSelf
 */
export function on<T extends keyof NoitaHooks>(name: T, cb: NoitaHooks[T]) {
  (globalThis as any)[`On${name}`] = cb;
}

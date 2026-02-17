declare enum ModSettingScope {
  /** Setting change is applied when a new game is started */
  NewGame = 0,
  /** Setting change is applied when the game is full-restarted */
  Restart = 1,
  /** Setting change is applied immediately */
  Runtime = 2,
}

type ModSettingCategory = {
  /**
   * The actual value does not matter (setting ids still have to be unique in
   * scope of the mod), this is used to differentiate categories from settings
   */
  category_id: string;
  /** The title of the category in the UI */
  ui_name: string;
  /** A description tooltip for the category */
  ui_description?: string;
  /** If `true` the category can be folded in the UI */
  foldable?: boolean;
  // _folded?: true;
  /** The settings within this category */
  settings: ModSetting[];

  // make it exclusive with values and labels
  id?: undefined;
  not_setting?: undefined;
};

type ModSettingLabel = {
  /** Indicates that this is not a setting, but instead just a label */
  not_setting: true;
  /** The text to show */
  ui_name: string;

  // make it exclusive with categories and values
  id?: undefined;
  category_id?: undefined;
};

interface ModSettingValue<V extends boolean | number | string | undefined> {
  /**
   * An identifier for the setting.
   * You can then use ModSettingGet(`${MOD_ID}.${id}`) to get the value
   */
  id: string;
  /** The name of the setting in the UI */
  ui_name: string;
  /** A description tooltip for the setting */
  ui_description?: string;
  /** The default value */
  value_default: V;
  /** When the setting change would be applied */
  scope: ModSettingScope;
  /** If `true` the setting is not shown */
  hidden?: boolean;
  /** A callback for when the setting is updated in the UI */
  change_fn?: (
    this: void,
    mod_id: string,
    gui: GuiID,
    in_main_menu: boolean,
    setting: this,
    old_value: V,
    new_value: V,
  ) => void;
  /** If set, this is called instead of default setting UI rendering code */
  ui_fn?: (
    this: void,
    mod_id: string,
    gui: GuiID,
    in_main_menu: boolean,
    im_id: number,
    setting: this,
  ) => void;

  // make it exclusive with categories and labels
  not_setting?: undefined;
  category_id?: undefined;
}

type ModSettingCheckbox = ModSettingValue<boolean>;

interface ModSettingEnum<K extends string = string> extends ModSettingValue<K> {
  values: [K, string][];
}

interface ModSettingSlider extends ModSettingValue<number> {
  /** Minimal value for number settings */
  value_min: number;
  /** Max value for number settings */
  value_max: number;
  value_display_multiplier?: number;
  value_display_formatting?: string;
}

interface ModSettingText extends ModSettingValue<string> {
  text_max_length?: number;
  allowed_characters?: string;
}

type ModSetting =
  | ModSettingCategory
  | ModSettingLabel
  | ModSettingCheckbox
  | ModSettingSlider
  | ModSettingEnum
  | ModSettingText;

type _SettingsMap<T> = {
  [S in Extract<T, ModSettingValue<any>> as S["id"]]: S extends ModSettingEnum<
    infer K
  >
    ? K
    : Widen<S["value_default"]>;
} & UnionToIntersection<
  T extends ModSettingCategory ? _SettingsMap<T["settings"][number]> : {}
>;

type ExtractSettings<T> = T extends { default: (infer S)[] }
  ? Prettify<_SettingsMap<S>>
  : never;

declare global {
  interface SettingsShape extends ExtractSettings<
    typeof import("./settings")
  > {}
}

export default [
  {
    id: "checkbox",
    ui_name: "checkbox",
    ui_description: "This is a test setting",
    value_default: false,
    scope: ModSettingScope.Runtime,
  },
] as const satisfies ModSetting[];

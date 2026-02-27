// By doing settings in such a way, we can have auto-completable
//`mod.settings.checkbox` anywhere, and it would also have a correct `boolean`
// type.
//
// Additionally, you also can declare something like this anywhere:
// ```typesctipt
// declare global {
//   interface SettingsShape {
//     a_setting_we_just_use_to_persist_stuff: string
//   }
// }
// And just get/set/delete it via `mod.settings.<name> = <value>` for convenience.
// It will use `mod_id.setting_name` key for the actual stored setting of course.
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

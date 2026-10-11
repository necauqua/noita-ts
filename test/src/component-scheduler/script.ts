// The script of the LuaComponent in entity.xml: both its script_source_file and
// its script_enabled_changed, so that the callback runs in the Lua state that
// the engine wakes up each frame.
import { MOD_ID } from "$mod";
import Scheduler from "@noita-ts/base/async";

const scheduler = Scheduler.get();

(globalThis as any).enabled_changed = (_entity: EntityID, enabled: boolean) => {
  if (enabled) {
    return;
  }
  const key = `${MOD_ID}.component-scheduler`;
  GlobalsSetValue(`${key}.start`, tostring(GameGetFrameNum()));
  (async () => {
    await scheduler.wait(20);
    GlobalsSetValue(`${key}.done`, tostring(GameGetFrameNum()));
  })().catch(print_error);
};

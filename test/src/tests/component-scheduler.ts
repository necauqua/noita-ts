import { MOD_ID } from "$mod";
import Scheduler from "@noita-ts/base/async";
import { assertEq, test } from "@noita-ts/base/test";

const ENTITY = `mods/${MOD_ID}/component-scheduler/entity.xml`;
const KEY = `${MOD_ID}.component-scheduler`;

test("Scheduler.get() polls once per frame in a LuaComponent script", async () => {
  const scheduler = Scheduler.get();
  const [x, y] = GameGetCameraPos();

  // three components share the Lua state of the script, so the engine wakes
  // it up three times per frame
  const first = EntityLoad(ENTITY, x, y);
  const others = [EntityLoad(ENTITY, x, y)];
  await scheduler.wait(2);

  // the callback starts the async code in the script
  const component = EntityGetFirstComponentIncludingDisabled(
    first,
    "LuaComponent",
    "scheduler",
  )!;
  EntitySetComponentIsEnabled(first, component, false);
  EntitySetComponentIsEnabled(first, component, true);

  // another component runs the script file again while the code waits
  await scheduler.wait(5);
  others.push(EntityLoad(ENTITY, x, y));
  await scheduler.wait(25);

  for (const entity of [first, ...others]) {
    EntityKill(entity);
  }

  const start = tonumber(GlobalsGetValue(`${KEY}.start`, ""));
  const done = tonumber(GlobalsGetValue(`${KEY}.done`, ""));
  assertEq(start !== undefined, true, "the callback ran");
  assertEq(done !== undefined, true, "the async code finished");
  assertEq(done! - start!, 20, "frames waited");
});

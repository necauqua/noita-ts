import { assert, assertEq, test } from "@noita-ts/base/test";

test("a vec2 field is got and set as two values", () => {
  const entity = EntityCreateNew("vec2");
  const velocity = EntityAddComponent2(entity, "VelocityComponent", {
    gravity_y: 1,
  });
  ComponentSetValue2(velocity, "mVelocity", 5, 6);
  const [x, y] = ComponentGetValue2(velocity, "mVelocity");
  EntityKill(entity);
  assertEq(x, 5, "x");
  assertEq(y, 6, "y");
});

test("an xform field is got as five values", () => {
  const entity = EntityCreateNew("xform");
  const inherit = EntityAddComponent2(entity, "InheritTransformComponent");
  ComponentSetValue2(inherit, "Transform", 1, 2, 3, 4, 0.5);
  const [x, y, scaleX, scaleY, rotation] = ComponentGetValue2(
    inherit,
    "Transform",
  );
  EntityKill(entity);
  assertEq(x, 1, "x");
  assertEq(y, 2, "y");
  assertEq(scaleX, 3, "scale_x");
  assertEq(scaleY, 4, "scale_y");
  assertEq(rotation, 0.5, "rotation");
});

test("GameGetPlayerStatsEntity takes the index of the player", () => {
  assert(GameGetPlayerStatsEntity(0) !== 0, "no stats entity for player 0");
  assertEq(GameGetPlayerStatsEntity(1), 0, "the stats entity of player 1");
});

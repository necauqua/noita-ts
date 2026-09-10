import { MOD_ID } from "$mod";
import { assert, assertEq, log, test } from "@noita-ts/base/test";
import ffi from "@noita-ts/ffi";
import MOD_CONTEXT from "@noita-ts/ffi/mods";

test("MOD_CONTEXT lists the loaded mods", () => {
  const mods = MOD_CONTEXT.loaded_mods;
  const ids: string[] = [];
  for (let i = 0; i < mods.len(); i++) {
    ids[i] = tostring(mods.start[i].id);
  }
  log("MOD_CONTEXT.loaded_mods =", table.concat(ids, ", "));

  // the game itself is the first entry, under an empty id
  assert(mods.len() > 1, "no mods are loaded");
  assertEq(ids[0], "", "the id of the first entry");

  let found = false;
  for (const id of ids) {
    found = found || id == MOD_ID;
  }
  assert(found, `${MOD_ID} is not among the loaded mods`);
});

test("MOD_CONTEXT.get finds the mod of the test suite", () => {
  const mod = MOD_CONTEXT.get(MOD_ID);
  assert(mod != undefined, `${MOD_ID} is not loaded`);
  assertEq(tostring(mod.id), MOD_ID, "mod.id");
  assertEq(tostring(mod.script_path), `mods/${MOD_ID}`, "mod.script_path");
  assertEq(mod.unsafe, true, "mod.unsafe");

  // the test mod is put into the mods folder rather than the Workshop
  assertEq(tostring(mod.workshop_path), "", "mod.workshop_path");

  assertEq(MOD_CONTEXT.get("no-such-mod"), undefined, "an unknown mod");
});

test("MOD_CONTEXT.path points at the folder of the mod", () => {
  const path = MOD_CONTEXT.path();
  log("MOD_CONTEXT.path() =", path);
  assertEq(path, `mods/${MOD_ID}`, "the path of the test mod");
});

test("MOD_CONTEXT.loadDll loads a DLL out of the mod", () => {
  const hde32 = MOD_CONTEXT.loadDll("lua_modules/@noita-ts/ffi/hde32.dll");
  assert(hde32 != undefined, "hde32.dll did not load");

  // 0xCC is `INT3`, the one byte the padding between functions is made of
  const int3 = ffi.new("uint8_t[1]", [0xCC]);
  assertEq(hde32.hde32_len(int3), 1, "the length of an INT3");
});

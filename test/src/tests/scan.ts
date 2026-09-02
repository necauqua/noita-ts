import ffi, { _ } from "@noita-ts/ffi";
import { assert, assertEq, test } from "@noita-ts/base/test";

// a stable instruction to aim at: the DeathMatch constructor storing its
// vftable, mov [edi], <vftable> - C7 07 <vftable>
const vftable = ffi.locateVftable(".?AVDeathMatch@@");
const store = ffi.text.scanAll([0xC7, 0x07, ...ffi.le32(vftable)], {
  name: "DeathMatch constructor vftable store",
});

test("a wildcard matches a byte of any value", () => {
  const found = ffi.text.scan([0xC7, 0x07, _, _, _, _], {
    at: store,
    limit: 8,
    name: "wildcarded vftable store",
  });
  assertEq(found, store, "address of the wildcarded match");
});

test("a needle may start with a wildcard", () => {
  const found = ffi.text.scan([_, 0xC7, 0x07, _, _, _, _], {
    at: store - 1,
    limit: 8,
    name: "wildcarded vftable store",
  });
  assertEq(found, store - 1, "address of the wildcarded match");
});

test("a backwards scan handles wildcards too", () => {
  const found = ffi.text.scan([0xC7, 0x07, _, _, _, _], {
    at: store + 6,
    back: true,
    limit: 8,
    name: "wildcarded vftable store",
  });
  assertEq(found, store, "address of the wildcarded match");
});

test("the bytes around a wildcard still have to match", () => {
  let found = false;
  // the byte after the store is anything but 0xC7, so this cannot match there
  pcall(() => {
    ffi.text.scan([_, 0xC7, 0x07, _, _, _, _], {
      at: store + 1,
      limit: 8,
      name: "wildcarded vftable store",
    });
    found = true;
  });
  assert(!found, "a wildcard made the whole needle match");
});

import ffi, { _, Needle, ScanParams } from "@noita-ts/ffi";
import { assert, assertEq, test } from "@noita-ts/base/test";

/// Wildcards over a buffer we control, which pins down the exact addresses.

const FILLER = 0xEE;
const LEN = 64;

const buf = ffi.new(`uint8_t[${LEN}]`);
for (let i = 0; i < LEN; i++) {
  buf[i] = FILLER;
}

const write = (at: number, bytes: number[]) => {
  for (let i = 0; i < bytes.length; i++) {
    buf[at + i] = bytes[i]!;
  }
};

// two near-identical marks, so `skip` has something to walk over
const first = 16;
const second = 32;
write(first, [0xDE, 0xAD, 0xBE, 0xEF]);
write(second, [0xDE, 0xAD, 0x00, 0xEF]);

const start = tonumber(ffi.cast("uint32_t", buf))!;
const buffer = ffi.Section.new("test buffer", start, LEN);

/** Scans the whole buffer, unless the parameters say otherwise. */
const scan = (needle: Needle, params: ScanParams = {}) =>
  buffer.scanAll(needle, { name: "test needle", ...params });

test("a needle without wildcards is found", () => {
  assertEq(scan([0xDE, 0xAD, 0xBE, 0xEF]), start + first, "the match address");
});

test("a wildcard matches a byte of any value", () => {
  assertEq(scan([0xDE, 0xAD, _, 0xEF]), start + first, "the match address");
});

test("a needle may end with wildcards", () => {
  assertEq(scan([0xDE, 0xAD, _, _]), start + first, "the match address");
});

// the anchor is the first byte of the needle that is not a wildcard, so a
// leading wildcard makes a scan look for a byte that is not at the match address

test("a needle may start with a wildcard", () => {
  assertEq(
    scan([_, 0xDE, 0xAD, 0xBE, 0xEF]),
    start + first - 1,
    "the match address",
  );
});

test("a needle may start with several wildcards", () => {
  assertEq(
    scan([_, _, 0xDE, 0xAD, 0xBE, 0xEF]),
    start + first - 2,
    "the match address",
  );
});

test("the bytes around a wildcard still have to match", () => {
  // the second mark holds 0x00 where this needle wants 0xBE, so the first mark
  // is the only match
  assertEq(scan([0xDE, _, 0xBE, 0xEF]), start + first, "the match address");
  const [ok] = pcall(() => scan([0xDE, _, 0xBE, 0xEF], { skip: 1 }));
  assert(!ok, "a wildcard made the needle match the other mark");
});

test("skip walks the matches of a wildcarded needle", () => {
  assertEq(
    scan([0xDE, 0xAD, _, 0xEF], { skip: 1 }),
    start + second,
    "the second match address",
  );
});

test("a backwards scan handles wildcards too", () => {
  assertEq(
    scan([0xDE, 0xAD, _, 0xEF], { back: true }),
    start + second,
    "the last match address",
  );
  assertEq(
    scan([0xDE, 0xAD, _, 0xEF], { back: true, skip: 1 }),
    start + first,
    "the match before it",
  );
});

test("a backwards scan handles a leading wildcard too", () => {
  assertEq(
    scan([_, _, 0xDE, 0xAD, 0xBE, 0xEF], { back: true }),
    start + first - 2,
    "the match address",
  );
});

test("limit counts the positions a needle was tried at", () => {
  const at = first - 2; // where this needle matches
  const needle = [_, _, 0xDE, 0xAD, 0xBE, 0xEF];
  const [ok] = pcall(() => scan(needle, { limit: at }));
  assert(!ok, "the scan reached past its limit");
  assertEq(scan(needle, { limit: at + 1 }), start + at, "the match address");
});

test("a needle of only wildcards is rejected", () => {
  const [ok, err] = pcall(() => scan([_, _]));
  assert(!ok, "a needle of only wildcards was accepted");
  const [found] = string.find(tostring(err), "only wildcards", 1, true);
  assert(found !== undefined, `unexpected error: ${tostring(err)}`);
});

test("a failed scan points at the code that asked for it", () => {
  const [, err] = pcall(() => scan([0xDE, 0xAD, 0xBE, 0x00]));
  const [found] = string.find(tostring(err), "scan.lua", 1, true);
  assert(found !== undefined, `unexpected error: ${tostring(err)}`);
});

test("scanAll leaves the parameters it was given alone", () => {
  const params: ScanParams = { name: "test needle" };
  buffer.scanAll([0xDE, 0xAD, 0xBE, 0xEF], params);
  assertEq(params.limit, undefined, "the limit of the parameters table");
});

/// And the same over real code, where scans walk instruction boundaries
/// instead of every byte.

// a stable instruction to aim at: the DeathMatch constructor storing its
// vftable, mov [edi], <vftable> - C7 07 <vftable>
const vftable = ffi.locateVftable(".?AVDeathMatch@@");
const store = ffi.text.scanAll([0xC7, 0x07, ...ffi.le32(vftable)], {
  name: "DeathMatch constructor vftable store",
});

test("a wildcard matches a byte of any value in code", () => {
  const found = ffi.text.scan([0xC7, 0x07, _, _, _, _], {
    at: store,
    limit: 8,
    name: "wildcarded vftable store",
  });
  assertEq(found, store, "address of the wildcarded match");
});

test("a needle may start with a wildcard in code", () => {
  const found = ffi.text.scan([_, 0xC7, 0x07, _, _, _, _], {
    at: store - 1,
    limit: 8,
    name: "wildcarded vftable store",
  });
  assertEq(found, store - 1, "address of the wildcarded match");
});

test("a backwards scan over code handles wildcards too", () => {
  const found = ffi.text.scan([0xC7, 0x07, _, _, _, _], {
    at: store + 6,
    back: true,
    limit: 8,
    name: "wildcarded vftable store",
  });
  assertEq(found, store, "address of the wildcarded match");
});

test("the bytes around a wildcard still have to match in code", () => {
  // the byte after the store is anything but 0xC7, so this cannot match there
  const [ok] = pcall(() =>
    ffi.text.scan([_, 0xC7, 0x07, _, _, _, _], {
      at: store + 1,
      limit: 8,
      name: "wildcarded vftable store",
    })
  );
  assert(!ok, "a wildcard made the whole needle match");
});

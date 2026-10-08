import ffi from "@noita-ts/ffi";
import { assert, assertEq, test } from "@noita-ts/base/test";

// the values outlive the Lua state, and the names are shared by the whole
// process, so every test uses names of its own, and removes their values
// first, so that it can run again in the same process

/** `name`, without a value. */
const fresh = (name: string) => {
  ffi.store.set(name, undefined);
  return name;
};

test("a stored string comes back", () => {
  const name = fresh("noita_ts_test.store.string");
  assertEq(ffi.store.get(name), undefined, "the value before the set");
  ffi.store.set(name, "a value = with spaces");
  assertEq(ffi.store.get(name), "a value = with spaces", "the value");
  ffi.store.set(name, undefined);
  assertEq(ffi.store.get(name), undefined, "the value after the removal");
});

test("an empty string is a value", () => {
  const name = fresh("noita_ts_test.store.empty");
  ffi.store.set(name, "");
  assertEq(ffi.store.get(name), "", "the value");
});

test("a long string comes back whole", () => {
  const name = fresh("noita_ts_test.store.long");
  const value = string.rep("0123456789", 100);
  ffi.store.set(name, value);
  assertEq(ffi.store.get(name), value, "the value");
});

test("shared runs init once and keeps the type", () => {
  const name = fresh("noita_ts_test.store.shared");
  let calls = 0;
  const init = () => {
    calls += 1;
    return 0xDEADBEEF;
  };
  assertEq(ffi.store.shared(name, init), 0xDEADBEEF, "the first value");
  assertEq(ffi.store.shared(name, init), 0xDEADBEEF, "the second value");
  assertEq(calls, 1, "the number of calls to init");
  assertEq(ffi.store.get(name), "3735928559", "the value as text");

  const text = fresh("noita_ts_test.store.shared_text");
  assertEq(ffi.store.shared(text, () => "123"), "123", "the first string");
  assertEq(ffi.store.shared(text, () => "other"), "123", "the second string");
});

test("shared stores nothing when init throws", () => {
  const name = fresh("noita_ts_test.store.throws");
  const [ok] = pcall(() => ffi.store.shared(name, () => error("broken init")));
  assert(!ok, "shared did not throw");
  assertEq(ffi.store.get(name), undefined, "the value");
});

test("a name with = is rejected", () => {
  const [ok] = pcall(() => ffi.store.set("a=b", "value"));
  assert(!ok, "the name was taken");
});

/** Every byte, from 0 to 255, twice, and then UTF-8 text. */
const ALL_BYTES = (() => {
  const bytes: number[] = [];
  for (let i = 0; i < 256; i++) {
    bytes.push(i);
  }
  const all = string.char(...bytes);
  return `${all}${all}Ünïcödé 文字`;
})();

test("a value of any bytes comes back unchanged", () => {
  const name = fresh("noita_ts_test.store.bytes");
  ffi.store.set(name, ALL_BYTES);
  assert(ffi.store.get(name) === ALL_BYTES, "the value of set changed");

  const shared = fresh("noita_ts_test.store.shared_bytes");
  assert(ffi.store.shared(shared, () => ALL_BYTES) === ALL_BYTES, "the first value of shared changed");
  assert(ffi.store.shared(shared, () => "") === ALL_BYTES, "the stored value of shared changed");
});

test("a name of any bytes but = is a name of its own", () => {
  const name = fresh("noita_ts_test.store.ü\0文");
  const other = fresh("noita_ts_test.store.ü");
  ffi.store.set(name, "the value");
  assertEq(ffi.store.get(name), "the value", "the value");
  assertEq(ffi.store.get(other), undefined, "the value of a name without the NUL");
});

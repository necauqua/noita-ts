import ffi from "@noita-ts/ffi";
import { assert, test } from "@noita-ts/base/test";

test("a once flag is true only the first time", () => {
  const name = "noita_ts_test_once_flag";
  assert(ffi.once(name), "the first call did not claim the flag");
  assert(!ffi.once(name), "the second call claimed the flag again");
});

test("a once flag is not case sensitive", () => {
  // the flags are environment variables of the process, and Windows compares
  // their names without their case
  const name = "noita_ts_test_case_flag";
  assert(ffi.once(name), "the first call did not claim the flag");
  assert(!ffi.once(string.upper(name)), "the flag is case sensitive");
});

test("a once flag is not a value of the store", () => {
  const name = "noita_ts_test_once_store";
  ffi.store.set(name, undefined);
  assert(ffi.once(name), "the first call did not claim the flag");
  assert(ffi.store.get(name) === undefined, "the flag is in the store");
});

test("an empty once name is rejected", () => {
  const [ok] = pcall(() => ffi.once(""));
  assert(!ok, "the name was taken");
});

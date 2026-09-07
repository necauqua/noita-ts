import ffi from "@noita-ts/ffi";
import { assert, test } from "@noita-ts/base/test";

test("a once flag is true only the first time", () => {
  const name = "noita_ts_test_once_flag";
  assert(ffi.once(name), "the first call did not claim the flag");
  assert(!ffi.once(name), "the second call claimed the flag again");
});

test("a once flag is not case sensitive", () => {
  // the flags live in the atom table of the process, which compares the names
  // without their case
  const name = "noita_ts_test_case_flag";
  assert(ffi.once(name), "the first call did not claim the flag");
  assert(!ffi.once(string.upper(name)), "the flag is case sensitive");
});

test("a name over the length limit is rejected", () => {
  const [ok, err] = pcall(() => ffi.once(string.rep("x", 242)));
  assert(!ok, "an over-long name was accepted");
  const [found] = string.find(tostring(err), "at most 241", 1, true);
  assert(found !== undefined, `unexpected error: ${tostring(err)}`);
});

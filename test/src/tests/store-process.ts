import ffi from "@noita-ts/ffi";
import { assert, assertEq, test } from "@noita-ts/base/test";

// a process that the game starts gets a copy of the environment; the test
// makes the values look like such a copy: it gives `NOITA_TS_PROCESS` the id
// of another process, and sets the variables of the store and of `ffi.once`
// directly. That removes all the values of the process, also the ones of the
// other tests and of the packages (e.g. the once flags of their patches), so
// the test puts them back at the end. It does not yield, so nothing else runs
// in between

ffi.cdef(`
  bool SetEnvironmentVariableA(const char* name, const char* value);
  uint32_t GetEnvironmentVariableA(const char* name, char* buffer, uint32_t size);
  bool SetEnvironmentVariableW(const uint16_t* name, const uint16_t* value);
  uint16_t* GetEnvironmentStringsW();
  bool FreeEnvironmentStringsW(uint16_t* block);
  uint32_t GetCurrentProcessId();
`);

const C = ffi.C;

const getEnv = (name: string) => {
  const buffer = ffi.new("char[64]");
  const len = C.GetEnvironmentVariableA(name, buffer, 64);
  return len === 0 ? undefined : ffi.string(buffer, len);
};

const EQUALS = 61;
const PREFIX = "NOITA_TS_";

/** A wide string with the units `units[from]` to `units[to - 1]`. */
const wide = (units: number[], from: number, to: number) => {
  const str = ffi.new("uint16_t[?]", to - from + 1);
  for (let i = from; i < to; i++) {
    str[i - from] = units[i];
  }
  return str;
};

/**
 * The variables of the environment whose names start with `NOITA_TS_`, as
 * pairs of the name and the value (wide strings).
 */
const snapshot = () => {
  const vars: [unknown, unknown][] = [];
  const block = C.GetEnvironmentStringsW() as Record<number, number>;
  let start = 0;
  while (block[start] !== 0) {
    const units: number[] = [];
    let i = start;
    while (block[i] !== 0) {
      units.push(block[i]);
      i += 1;
    }
    const prefix = units.slice(0, PREFIX.length).map((u) => (u < 0x80 ? u : 0x3f));
    if (string.upper(string.char(...prefix)) === PREFIX) {
      const eq = units.indexOf(EQUALS);
      vars.push([wide(units, 0, eq), wide(units, eq + 1, units.length)]);
    }
    start = i + 1;
  }
  C.FreeEnvironmentStringsW(block);
  return vars;
};

test("the values of another process are removed", () => {
  const saved = snapshot();
  try {
    // a value of this process, so that the owner is this process
    ffi.store.set("noita_ts_test.process.mine", "mine");
    assertEq(
      getEnv("NOITA_TS_PROCESS"),
      tostring(C.GetCurrentProcessId()),
      "the owner of the values",
    );

    // a copy from another process: its owner, a value, a shared address in
    // another case and a once flag
    assert(C.SetEnvironmentVariableA("NOITA_TS_PROCESS", "0"), "the owner was not set");
    assert(
      C.SetEnvironmentVariableA("NOITA_TS_STORE_noita_ts_test.process.value", "sold"),
      "the value was not set",
    );
    assert(
      C.SetEnvironmentVariableA("noita_ts_store_noita_ts_test.process.shared", "n1234"),
      "the shared value was not set",
    );
    assert(
      C.SetEnvironmentVariableA("NOITA_TS_ONCE_noita_ts_test_process_once", "1"),
      "the once flag was not set",
    );
    assert(C.SetEnvironmentVariableA("NOITA_TS_OTHER", "other"), "the other variable was not set");

    assertEq(ffi.store.get("noita_ts_test.process.value"), undefined, "the value of the other process");
    assertEq(
      getEnv("NOITA_TS_PROCESS"),
      tostring(C.GetCurrentProcessId()),
      "the owner after the removal",
    );
    assertEq(ffi.store.shared("noita_ts_test.process.shared", () => 42), 42, "the shared value");
    assert(ffi.once("noita_ts_test_process_once"), "the once flag of the other process stayed");
    // the owner was another process, so the value of this process is gone too
    assertEq(ffi.store.get("noita_ts_test.process.mine"), undefined, "the value of this process");
    assertEq(getEnv("NOITA_TS_OTHER"), "other", "a variable that is not a value");
  } finally {
    for (const [name] of snapshot()) {
      C.SetEnvironmentVariableW(name, null);
    }
    for (const [name, value] of saved) {
      C.SetEnvironmentVariableW(name, value);
    }
  }
});

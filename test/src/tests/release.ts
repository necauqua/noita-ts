import ffi from "@noita-ts/ffi";
import c from "@noita-ts/ffi/schema";
import { assert, assertEq, test } from "@noita-ts/base/test";

/// What closing the Lua state does to caves, hooks and executable memory,
/// checked through `ffi._release`, which runs the same teardown.
///
/// `ffi._release` affects the whole Lua state of the test mod: it undoes every
/// scoped cave and hook, calls every function of `ffi.onRelease` (for example
/// the release of an HTTP client of @noita-ts/http), and frees all of the scoped
/// memory. Thus the other tests make such things in their tests, never when
/// their files load, and `src/test.ts` registers this test first, so that it
/// is done before the other tests start.

// see https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-memory_basic_information
const MemoryBasicInformation = c.declare("TestMemoryBasicInformation", [
  c.field("BaseAddress", c.voidptr),
  c.field("AllocationBase", c.voidptr),
  c.field("AllocationProtect", c.u32),
  c.field("RegionSize", c.u32),
  c.field("State", c.u32),
  c.field("Protect", c.u32),
  c.field("Type", c.u32),
]);

ffi.cdef(`
  size_t VirtualQuery(const void* address, ${MemoryBasicInformation.name}* buffer, size_t length);
`);

const MEM_FREE = 0x10000;

const EAX = 0xDEADBEEF;
const OTHER = 0x11111111;

// mov eax, EAX / mov edx, 0x0BADF00D / ret
//
// the hook goes on the second instruction, which the jump of the cave
// displaces exactly
const CODE = [
  0xB8, ...ffi.le32(EAX),
  0xBA, ...ffi.le32(0x0BADF00D),
  0xC3,
];
const HOOK_AT = 5;

// a cave payload that changes what the stub returns: mov eax, OTHER
const PAYLOAD = [0xB8, ...ffi.le32(OTHER)];

/**
 * A fresh copy of the stub, in persistent memory, so that it can still be
 * called after the release.
 */
const stub = () => {
  const mem = ffi.allocExec(CODE.length, { persistent: true });
  for (let i = 0; i < CODE.length; i++) {
    mem[i] = CODE[i]!;
  }
  return {
    at: tonumber(ffi.cast("uint32_t", mem))! + HOOK_AT,
    call: ffi.cast<(this: void) => number>("uint32_t (__cdecl *)(void)", mem),
  };
};

/** Whether the hooked instruction is still the one the stub was built with. */
const untouched = (at: number) => {
  const bytes = ffi.cast("uint8_t*", at);
  for (let i = 0; i < 5; i++) {
    if (bytes[i] !== CODE[HOOK_AT + i]) {
      return false;
    }
  }
  return true;
};

/** Whether the memory at `addr` is released. */
const released = (addr: number) => {
  const info = ffi.new(`${MemoryBasicInformation.name}[1]`);
  const size = ffi.sizeof(info);
  const got = ffi.C.VirtualQuery(ffi.cast("void*", addr), info, size);
  assertEq(tonumber(got), size, "what VirtualQuery wrote");
  return info[0].State === MEM_FREE;
};

test("release undoes the scoped caves and hooks, calls onRelease, and frees the memory", () => {
  const scoped = stub();
  const hooked = stub();
  const kept = stub();

  const scopedCave = ffi.cave(scoped.at, PAYLOAD);
  let calls = 0;
  const hook = ffi.hook(hooked.at, () => {
    calls += 1;
  });
  const keptCave = ffi.cave(kept.at, PAYLOAD, { persistent: true });
  const scratch = tonumber(ffi.cast("uint32_t", ffi.allocExec(1)))!;

  // what the functions of `onRelease` saw, as an error in them is only printed
  const seen: string[] = [];
  const remove = ffi.onRelease(() => {
    seen.push("a removed function");
  });
  ffi.onRelease(() => {
    // newer than the caves, and before the memory is freed
    seen.push(untouched(scoped.at) ? "no cave" : "the cave");
    seen.push(released(scratch) ? "no memory" : "the memory");
  });
  remove();

  assertEq(scoped.call(), OTHER, "what the scoped cave returned");
  assertEq(hooked.call(), EAX, "what the hooked code returned");
  assertEq(calls, 1, "the number of calls into the hook");
  assertEq(kept.call(), OTHER, "what the persistent cave returned");

  ffi._release();

  assertEq(seen.join(", "), "the cave, the memory", "what onRelease saw");

  assert(untouched(scoped.at), "the scoped cave was not undone");
  assertEq(scoped.call(), EAX, "what the code returned once the cave was gone");

  assert(untouched(hooked.at), "the hook was not undone");
  assertEq(hooked.call(), EAX, "what the code returned once the hook was gone");
  assertEq(calls, 1, "the number of calls into a released hook");

  assert(!untouched(kept.at), "the persistent cave was undone");
  assertEq(kept.call(), OTHER, "what the persistent cave returned after the release");

  assert(released(scopedCave), "the scoped cave was not freed");
  assert(released(hook.cave), "the cave of the hook was not freed");
  assert(released(scratch), "the scoped allocation was not freed");
  assert(!released(keptCave), "the persistent cave was freed");

  // the hook is already gone, so this does nothing
  hook.remove();
});

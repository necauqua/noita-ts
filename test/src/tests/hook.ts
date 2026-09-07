import ffi from "@noita-ts/ffi";
import { assert, assertEq, test } from "@noita-ts/base/test";

/// Hooks over a stub we assemble ourselves, so the tests do not depend on any
/// particular piece of the game staying where it is.

const EAX = 0xDEADBEEF;
const ECX = 0x12345678;

// mov eax, EAX / mov ecx, ECX / mov edx, 0x0BADF00D / ret
//
// the hook goes on the third instruction: the first two are done by then, and
// the jump of the cave displaces exactly one whole instruction
const CODE = [
  0xB8, ...ffi.le32(EAX),
  0xB9, ...ffi.le32(ECX),
  0xBA, ...ffi.le32(0x0BADF00D),
  0xC3,
];
const HOOK_AT = 10;

/** A fresh copy of the stub: the address to hook, and a call into it. */
const stub = () => {
  const mem = ffi.allocExec(CODE.length);
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

test("a hook sees the registers of the hooked code", () => {
  const { at, call } = stub();

  let eax = 0;
  let ecx = 0;
  ffi.hook(at, (regs) => {
    eax = regs.eax;
    ecx = regs.ecx;
  });

  assertEq(call(), EAX, "what the hooked code returned");
  assertEq(eax, EAX, "the value of eax");
  assertEq(ecx, ECX, "the value of ecx");
});

test("a hook writing to a register changes it", () => {
  const { at, call } = stub();

  ffi.hook(at, (regs) => {
    regs.eax = regs.ecx;
  });

  assertEq(call(), ECX, "what the hooked code returned");
});

test("remove puts the hooked instructions back", () => {
  const { at, call } = stub();

  let calls = 0;
  const hook = ffi.hook(at, () => {
    calls += 1;
  });

  assert(!untouched(at), "the hook did not patch anything");
  call();

  hook.remove();
  assert(untouched(at), "the hooked instructions were not put back");
  assertEq(call(), EAX, "what the code returned once the hook was gone");
  assertEq(calls, 1, "the number of calls into a removed hook");
});

test("an address can be hooked again after remove", () => {
  // what a soft reload of a mod comes down to: the state that hooked goes away
  // and a new one hooks the same address again
  const { at, call } = stub();

  ffi.hook(at, () => {}).remove();

  let calls = 0;
  ffi.hook(at, () => {
    calls += 1;
  });

  assertEq(call(), EAX, "what the hooked code returned");
  assertEq(calls, 1, "the number of calls into the second hook");
});

test("an error in a hook does not reach the hooked code", () => {
  const { at, call } = stub();

  let called = false;
  ffi.hook(at, () => {
    called = true;
    error("this hook is broken");
  });

  assertEq(call(), EAX, "what the hooked code returned");
  assert(called, "the hook was not called at all");
});

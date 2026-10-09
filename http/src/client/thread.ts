// Blocking Windows API calls on native threads, so that the game does not stop
// while they wait (for example for the network). Lua cannot run on another
// thread, so a small x86 thread procedure calls the function, and the Lua side
// waits in a coroutine until the procedure marks the call as done.
//
// A thread can outlive the Lua state that started it (a new game starts during
// a download), so it never touches memory of the state:
// - the procedure is in persistent executable memory, made once per process
//   and shared through `ffi.store`;
// - the calls, the copies of string arguments and the memory that the calls
//   write into are on the process heap, in a `Pool`.
//
// Releasing a pool (its owner does that when the state is closed) frees its
// memory. A call that still runs is abandoned instead: the pool and the thread
// swap the state of the call atomically, and whichever of them comes second
// frees the memory of that call.

import ffi, { type Ptr } from "@noita-ts/ffi";
import c from "@noita-ts/ffi/schema";
import { describeError } from "../common";

const MAX_ARGS = 8;

ffi.cdef(`
  void* CreateThread(void* attributes, size_t stack_size, void* start, void* param, uint32_t flags, uint32_t* id);
  int CloseHandle(void* handle);
  uint32_t GetLastError();
  void* GetProcessHeap();
  void* HeapAlloc(void* heap, uint32_t flags, size_t bytes);
  int HeapFree(void* heap, uint32_t flags, void* mem);
`);

const C = ffi.C;

/** The `GetLastError` of this thread. */
export const lastError = (): number => C.GetLastError();

/** The thread runs the call. */
const RUNNING = 0;
/** The thread is done; Lua frees the memory of the call. */
const DONE = 1;
/** The pool is released; the thread frees the memory of the call. */
const ABANDONED = 2;

/**
 * `entry` is the thread procedure, `DWORD WINAPI proc(call*)`: it pushes the
 * arguments, the last one first, calls `fn`, stores its result and the
 * `GetLastError` of the thread, and swaps `state` to DONE (`xchg` with memory
 * is atomic, and orders the stores before it). If the state was ABANDONED,
 * the pool is gone, so the thread frees the `owned` memory and the call itself.
 * `esp` comes back from `ebp`, so that `fn` can be stdcall or cdecl.
 *
 * `swap_state` is `uint32_t __cdecl swap_state(call*, uint32_t state)`: it
 * swaps the state of a call atomically and returns the old one, for the Lua
 * side, which has no atomic operations.
 */
const CODE = asm(`
entry:
    push ebp
    mov  ebp, esp
    push ebx
    push esi
    mov  ebx, [ebp+8]               ; the call
    mov  ecx, [ebx+4]               ; argc
    test ecx, ecx
    jz   .call
.push:
    push dword [ebx+ecx*4+4]        ; args[ecx-1]
    dec  ecx
    jnz  .push
.call:
    call dword [ebx]                ; fn
    mov  [ebx+40], eax              ; result
    call dword [ebx+52]             ; GetLastError
    mov  [ebx+44], eax              ; error
    lea  esp, [ebp-8]
    mov  eax, 1                     ; DONE
    xchg [ebx+48], eax              ; state
    cmp  eax, 2                     ; ABANDONED
    jne  .out
    mov  esi, [ebx+64]              ; owned_count
.free:
    test esi, esi
    jz   .self
    dec  esi
    push dword [ebx+esi*4+68]       ; owned[esi]
    push 0
    push dword [ebx+60]             ; heap
    call dword [ebx+56]             ; HeapFree
    jmp  .free
.self:
    push ebx                        ; the call itself, not touched after this
    push 0
    push dword [ebx+60]
    call dword [ebx+56]
.out:
    pop  esi
    pop  ebx
    xor  eax, eax
    pop  ebp
    ret  4

swap_state:
    mov  ecx, [esp+4]               ; the call
    mov  eax, [esp+8]               ; the new state
    xchg [ecx+48], eax
    ret
`);

/** A 32-bit FNV-1a hash of `bytes`, as a signed decimal number. */
const hash = (bytes: readonly number[]) => {
  let h = 0x811c9dc5 | 0;
  for (const b of bytes) {
    h ^= b;
    // the product of two 32-bit numbers does not fit into a double, so
    // multiply by the FNV prime (0x01000193) in two parts
    h = (h * 0x193 + (h << 24)) | 0;
  }
  return tostring(h);
};

/** A call on a thread. The thread procedure has the offsets of its fields. */
const Call = c.declare("NoitaTsHttpCall", [
  // the function to call
  c.field("fn", c.voidptr),
  // the number of arguments, at most MAX_ARGS
  c.field("argc", c.u32),
  c.field("args", c.u32.arr(MAX_ARGS)),
  // eax of the call
  c.field("result", c.u32),
  // GetLastError of the thread, right after the call
  c.field("error", c.u32),
  // RUNNING, DONE or ABANDONED, swapped atomically
  c.field("state", c.escape<number>("volatile uint32_t", 4, 4)),
  // the address of GetLastError
  c.field("get_last_error", c.voidptr),
  // the address of HeapFree
  c.field("heap_free", c.voidptr),
  // the process heap
  c.field("heap", c.voidptr),
  c.field("owned_count", c.u32),
  // what the thread frees when the call is abandoned
  c.field("owned", c.voidptr.arr(MAX_ARGS)),
]);
type Call = typeof Call.type;

let code: number | undefined;

/**
 * The address of the code, made once per process. The store is shared by all
 * the mods, and two mods can bundle different versions of this package, so
 * the name in the store comes from the bytes of the code. The bytes also fix
 * the offsets of the fields of the call, so a version that changes the code
 * or the layout of the call makes its own code, and never runs the code of
 * another version.
 */
const getCode = () => {
  code ??= ffi.store.shared(`http.proc.${hash(CODE.raw)}`, () => {
    const mem = ffi.allocExec(CODE.raw.length, { persistent: true });
    CODE.raw.forEach((b, i) => {
      mem[i] = b;
    });
    return tonumber(ffi.cast("uint32_t", mem))!;
  });
  return code;
};

type SwapState = (this: void, call: unknown, state: number) => number;

let swapState: SwapState | undefined;

/** Swaps the state of `call` atomically, and returns the old one. */
const swap = (call: Call, state: number) => {
  const fn = (swapState ??= ffi.cast<SwapState>(
    "uint32_t (__cdecl *)(void*, uint32_t)",
    getCode() + CODE.labels.swap_state,
  ));
  return fn(ffi.cast("void*", call), state);
};

const getLastError = ffi.cast("void*", C.GetLastError);
const heapFree = ffi.cast("void*", C.HeapFree);
const processHeap = C.GetProcessHeap();

const HEAP_ZERO_MEMORY = 0x8;

/** The address of a pointer, as a key of a table. */
const address = (ptr: unknown) => tonumber(ffi.cast("uintptr_t", ptr))!;

/**
 * An argument of a call: a number (`0` for NULL), a string (the call gets a
 * pointer to a copy of it on the process heap) or an FFI pointer. Memory that
 * the call uses after the state is closed must come from the `alloc` of the
 * pool; the thread frees such memory if the call is abandoned, so give it to
 * one call at a time, and only once in its arguments.
 *
 * Never `undefined` or `null`: in Lua, they make a hole in the arguments, so
 * the call pushes too few of them, the stdcall callee pops more, and the
 * thread jumps into its own stack.
 */
export type Arg = number | string | object;

/**
 * Memory on the process heap and the calls on threads that use it, released
 * together.
 */
export class Pool {
  /** The blocks of the pool, by address. */
  private blocks = new LuaTable<number, unknown>();
  /**
   * The calls that run on threads, and the addresses of the blocks that
   * their threads free if the pool is released first.
   */
  private calls = new LuaTable<Call, number[]>();
  private released = false;

  /**
   * `size` zeroed bytes on the process heap, as a pointer of type `ctype`.
   * They are freed by `free`, or when the pool is released.
   */
  alloc<T>(ctype: string, size: number): T {
    if (this.released) {
      throw new Error("the pool is released");
    }
    const mem = C.HeapAlloc(processHeap, HEAP_ZERO_MEMORY, size);
    if (mem == null) {
      throw new Error(`cannot allocate ${size} bytes`);
    }
    this.blocks.set(address(mem), mem);
    return ffi.cast<T>(ctype, mem);
  }

  /** Frees a block of the pool. Does nothing for anything else. */
  free(mem: unknown) {
    const key = address(mem);
    const block = this.blocks.get(key);
    if (block !== undefined) {
      this.blocks.delete(key);
      C.HeapFree(processHeap, 0, block);
    }
  }

  /**
   * Calls the function `fn` (a function of the FFI) with `args` (at most 8,
   * see {@link Arg}) on a new native thread, and waits for it with
   * `coroutine.yield()`, so only call it from a coroutine that is resumed
   * every frame, like the ones of a scheduler. Returns the result as an
   * unsigned 32-bit number and the `GetLastError` of the call.
   *
   * Throws if the pool is released before the call is done.
   */
  run(fn: unknown, ...args: Arg[]): [result: number, error: number] {
    const call = this.alloc<Call>(Call.ptr().name, Call.size);
    call.fn = ffi.cast("void*", fn);
    call.argc = args.length;
    call.get_last_error = getLastError;
    call.heap_free = heapFree;
    call.heap = processHeap;

    const copies: unknown[] = [];
    const owned: unknown[] = [];
    args.forEach((arg, i) => {
      if (typeof arg === "number") {
        call.args[i] = arg;
      } else if (typeof arg === "string") {
        const copy = this.alloc<unknown>("char*", arg.length + 1);
        ffi.copy(copy, arg);
        copies.push(copy);
        owned.push(copy);
        call.args[i] = ffi.cast<number>("uintptr_t", copy);
      } else {
        call.args[i] = ffi.cast<number>("uintptr_t", arg);
        if (this.blocks.has(address(arg))) {
          owned.push(arg);
        }
      }
    });
    owned.forEach((mem, i) => {
      call.owned[i] = mem as Ptr<unknown>;
    });
    call.owned_count = owned.length;

    const done = () => {
      for (const copy of copies) {
        this.free(copy);
      }
      this.free(call);
    };

    const thread = C.CreateThread(
      null,
      0,
      ffi.cast("void*", getCode() + CODE.labels.entry),
      ffi.cast("void*", call),
      0,
      null,
    );
    if (thread == null) {
      const error = lastError();
      done();
      throw new Error(
        `cannot create a thread: ${describeError("Windows", error)}`,
      );
    }
    C.CloseHandle(thread);
    this.calls.set(
      call,
      owned.map((mem) => address(mem)),
    );

    while (true) {
      // the release abandons all the calls, and the call may be freed already
      if (this.released) {
        throw new Error("the pool is released");
      }
      if (call.state === DONE) {
        break;
      }
      coroutine.yield();
    }
    this.calls.delete(call);
    const result: [number, number] = [call.result, call.error];
    done();
    return result;
  }

  /**
   * Frees all of the memory of the pool, except that of the calls that still
   * run: their threads free it when they are done. The calls throw when
   * their coroutines are resumed, and the pool takes no new ones.
   */
  release() {
    if (this.released) {
      return;
    }
    this.released = true;

    for (const [call, owned] of this.calls) {
      // the thread can free the call right after the swap, so what it owns
      // comes from `calls`, not from the call
      if (swap(call, ABANDONED) === RUNNING) {
        this.blocks.delete(address(call));
        for (const mem of owned) {
          this.blocks.delete(mem);
        }
      }
    }
    this.calls = new LuaTable();

    for (const [, block] of this.blocks) {
      C.HeapFree(processHeap, 0, block);
    }
    this.blocks = new LuaTable();
  }
}

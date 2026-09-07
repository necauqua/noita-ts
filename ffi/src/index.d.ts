/** @noSelfInFile */

declare const anyByte: unique symbol;

/**
 * The type of `_`, the wildcard byte of scan patterns.
 */
export interface AnyByte {
  readonly [anyByte]: true;
}

/**
 * The wildcard byte of scan patterns: it matches a byte of any value at that
 * position, for example `[0xA1, _, _, _, _, 0x85, 0xC0]` matches a `mov eax,
 * [addr]` with any address, followed by a `test eax, eax`.
 */
export const _: AnyByte;

/**
 * A pattern to search memory for.
 *
 * A sole number is taken as a 4-byte little-endian integer, a string is taken
 * as its bytes, and a list holds the bytes themselves, where `ffi._` stands for
 * a byte of any value.
 */
export type Needle = number | string | (number | AnyByte)[];

export interface ScanParams {
  /**
   * The number of matches to skip before finishing the scan.
   * Defaults to 0.
   */
  skip?: number;
  /**
   * The address to start the scan from.
   Defaults to start of section.
   */
  at?: number;
  /**
   * Whether to scan backwards from the given address, otherwise scans forwards.
   */
  back?: true;
  /**
   * The maximum number of bytes to scan.
   * Defaults to 256 bytes.
   * If the pattern is not found within this limit, the scan will stop.
   */
  limit?: number;
  /**
   * A name for the scan used in error messages.
   */
  name?: string;
}

/**
 * The general purpose registers of the hooked code, as `PUSHAD` saves them.
 *
 * Writing to a field puts the value back into the register when the hook
 * returns, except for `esp`, which `POPAD` leaves alone. `esp` also holds the
 * stack pointer as it is inside the trampoline: the one of the hooked code is 4
 * bytes above it, over the flags the trampoline pushed.
 */
export interface Regs {
  edi: number;
  esi: number;
  ebp: number;
  esp: number;
  ebx: number;
  edx: number;
  ecx: number;
  eax: number;
}

/** The function a hook runs. */
export type HookCallback = (this: void, regs: Ptr<Regs>) => void;

/**
 * A hook made by `ffi.hook`.
 */
export interface Hook {
  /** The address of the allocated cave. */
  readonly cave: number;

  /**
   * Undoes the hook: the hooked code goes back to the instructions it started
   * with, and the callback is released. The cave itself stays, as nothing ever
   * frees it.
   */
  remove(): void;
}

export interface Section {
  offset: number;
  len: number;

  /**
   * Scans the section for a given pattern using the given scan parameters.
   * params.limit defaults to 256 bytes, meaning that at most 256 bytes will be
   * scanned unless specified otherwise.
   *
   * @param needle The pattern to search for
   * @param params Additional parameters to control the scan
   * @return The address where the pattern was found
   */
  scan(needle: Needle, params?: ScanParams): number;

  /**
   * A shortcut for scan with a limit set to section length.
   * If you set params.limit to anything this is identical to calling scan.
   *
   * @param needle The pattern to search for
   * @param params Additional parameters to control the scan
   * @return The address where the pattern was found
   */
  scanAll(needle: Needle, params?: ScanParams): number;
}

declare const ffi: {

  /** The base address of the module, without ASLR enabled this is 0x00400000 */
  base: number,

  /** The `.data` memory address range */
  data: Section;
  /** The `.rdata` memory address range */
  rdata: Section;
  /** The `.text` memory address range */
  text: Section;

  /** The section class, to scan a memory range that is not part of the module */
  Section: {
    /**
     * Makes a section over an arbitrary memory range.
     *
     * The three sections of the module are already there as `ffi.data`,
     * `ffi.rdata` and `ffi.text`, so this is only for the rare case of scanning
     * memory that is not part of it.
     *
     * @param name The name of the range, used in error messages
     * @param offset The address the range starts at
     * @param len The length of the range in bytes
     * @param code Whether the range holds executable code, which makes scans
     * walk instruction boundaries instead of every byte
     * @return The section over that range
     */
    ["new"](
      this: void,
      name: string,
      offset: number,
      len: number,
      code?: boolean,
    ): Section;
  };

  /**
   * Splits a number into its 4 little-endian bytes.
   *
   * @param n The number to split
   * @return The 4 bytes, least significant first
   */
  le32(this: void, n: number): number[];

  /**
   * Fixes an address that was hardcoded for 0x00400000 base to the actual base
   * address of the module.
   * Basically a convenient shortcut for `addr - 0x00400000 + ffi.base`.
   *
   * @param addr The address to rebase
   * @return The rebased address
   */
  rebase(this: void, addr: number): number;

  /**
   * Calculates the length of the instruction at the given address.
   *
   * `@noita-ts/ffi` bundles a size-optimized build of HDE32 (a minimal 32-bit
   * instruction length disassembler) to calculate instruction lengths, this is
   * an API for calling it directly.
   *
   * @param addr The address to calculate the instruction length for
   * @return The length of the instruction at the given address
   */
  instrLen(this: void, addr: Ptr<any> | number): number;

  /**
   * Bump-allocates `size` bytes of readable, writable and executable memory,
   * 16-byte aligned, reserving a new arena when the current one runs out.
   *
   * The memory is never released - it lives for as long as the process does.
   *
   * @param size The number of bytes to allocate
   * @return A `char*` to the allocation
   */
  allocExec(this: void, size: number): Ptr<number>;

  /**
   * Allocates an executable code cave holding `bytes`, and redirects `addr` to
   * it with a `JMP rel32`.
   *
   * The whole instructions covered by that jump are copied to the end of the
   * cave, followed by a jump back to the instruction right after them, and any
   * leftover bytes of a partially overwritten instruction are filled with NOPs.
   *
   * Note that the displaced instructions are copied verbatim, so an instruction
   * with a relative operand (`CALL rel32`, `JMP`/`Jcc`, or anything else
   * offset-relative) will not survive the move.
   *
   * `bytes` may also be a function, as returned by linking an assembled patch
   * without a value for its `BASE` reloc: the cave is allocated first and the
   * function is called with its address to produce the final bytes.
   *
   * If the patch defines an `entry` label, the hook jumps there rather than to
   * the start of the cave, so a patch can put data in front of its code.
   *
   * @param addr The address to hook
   * @param bytes The code to run in the cave
   * @return The address of the allocated cave
   */
  cave(
    this: void,
    addr: number,
    bytes: number[] | string | ((this: void, base: number) => number[]),
  ): number;

  /**
   * Hooks `addr` with a cave that calls `fn` with the registers of the hooked
   * code.
   *
   * ```ts
   * const hook = ffi.hook(addr, (regs) => {
   *   print(string.format("0x%08X", regs.eax));
   *   regs.ecx = 0; // and back into the register it goes
   * });
   * hook.remove();
   * ```
   *
   * A hook is only alive for as long as the Lua state that made it: a callback
   * dies with its state while the cave lives on, so the hook is removed when
   * the state is closed, exactly as `remove` does it. That puts the hooked
   * instructions back the way they were, which leaves the address hookable
   * again - a soft reload of a mod simply hooks it once more from its new
   * state.
   *
   * The callback runs on the thread that the hooked code runs on, and a Lua
   * state may only be used from the thread that owns it, so a hook may only sit
   * on code that the game runs on the thread of the mod. Every call also
   * crosses the C boundary, which is far slower than a Lua call and cannot be
   * compiled, so a hook on hot code costs real frame time.
   *
   * @param addr The address to hook
   * @param fn The function to call
   * @return The hook
   */
  hook(this: void, addr: number, fn: HookCallback): Hook;

  /**
   * Locate a string in `.rdata`.
   * This adds a null terminator to the string before searching.
   *
   * @param str The string to locate
   * @return A memory address of the string
   */
  locateString(this: void, str: string): number;

  /**
   * Locate a PUSH <string> in `.text`.
   * This uses locateString to find the string, then scans for a PUSH instruction
   * that references that location.
   *
   * @param str The string to locate the PUSH for
   * @return A memory address of the PUSH instruction
   */
  locateStringPush(this: void, str: string): number;

  /**
   * Locate the vftable static memory address for a given RTTI name.
   *
   * @param name The RTTI name to locate the vftable for
   * @return A memory address of the vftable or undefined if not found
   */
  locateVftable(this: void, name: string): number;

  /**
   * Locate the address of a static global that uses a vftable with the
   * given RTTI name.
   *
   * @param name The name of the static global to locate
   * @return A memory address of the static global or undefined if not found
   */
  locateStaticGlobal(this: void, name: string): number;

  /**
   * Attempt to find a pattern in .text, this is just a  shortcut for
   * `text.scan(...)`.
   * Most of the time we want to scan actual code, and ".text" can be confusing
   * even though it is the name of the section.
   *
   * @param needle The pattern to search for
   * @param params Additional parameters to control the scan
   * @return The address where the pattern was found
   */
  scan(this: void, needle: Needle, params?: ScanParams): number;

  /**
   * Returns true the first time it is called with a given name, and false
   * after that, for as long as the game process lives.
   *
   * Note: the flags are case-insensitive.
   *
   * A mod runs in more than one Lua state, and every state loads its modules
   * again, so top-level code that scans and patches can run many times - while
   * the patches themselves stay in the process. Guard such code with this to
   * apply it exactly once per run of the game:
   *
   * ```ts
   * if (ffi.once("my_mod_health_patch")) {
   *   // scans and patches
   * }
   * ```
   *
   * The flag is set at the moment of the call, so a patch that throws is not
   * tried again.
   *
   * All mods share one set of names, which lets two mods that apply the same
   * patch agree on who does it. Put the name of your mod in the name if you do
   * not want that.
   *
   * @param name The name of the flag
   * @return Whether the caller is the first to ask for this name
   */
  once(this: void, name: string): boolean;

  /**
   * Attempt to patch a location in memory directly.
   * This attempts to undo and redo the memory protection around the write.
   *
   * @param addr The memory address to patch
   * @param patch The bytes to write at that location
   * @return Whether the patch was applied successfully and an error message if the patch failed
   */
  patchRaw(this: void, addr: number, patch: number[] | string): void;

  /**
   * Attempt to find a pattern in .text and patch it, just a shortcut for
   * `patchRaw(text.scanAll(...), ...)`.
   *
   * @param needle The pattern to search for
   * @param patch The bytes to write at that location
   * @param params Additional parameters to control the scan
   */
  patch(
    this: void,
    needle: Needle,
    patch: number[] | string,
    params?: ScanParams,
  ): void;

  /// LUAJIT FFI (because tstl one is lacking):

  cdef(this: void, cdefs: string): void;

  // Suggest<keyof CommonFfiTypes | `${keyof CommonFfiTypes}*`>
  cast<
    K extends (string & {}) | keyof CommonFfiTypes | `${keyof CommonFfiTypes}*`,
  >(
    this: void,
    type: K,
    ptr: any,
  ): FfiType<K>;
  cast<T>(this: void, type: string, ptr: any): T;

  offsetof(this: void, structName: string, memberName: string): number;

  sizeof(this: void, ct: string | any, nelem?: number): number;

  copy(this: void, dst: any, src: any, len?: number): void;

  C: Record<string, any>;

  load(this: void, libName: string): Record<string, any>;

  ["new"](this: void, ct: string, init?: unknown): any;

  string(this: void, ptr: any, len?: number): string;

  metatype(this: void, type: string, metatype: any): void;
};

declare const ptr: unique symbol;
interface PtrMark<T> {
  readonly [ptr]: T;
}

type Deref<T> = [T] extends [PtrMark<any>]
  ? unknown
  : { [K in keyof T & string]: T[K] };

export type Ptr<T> = {
  [offset: number]: T;
} & PtrMark<T> & Deref<T>;

export type CommonFfiTypes = {
  bool: boolean;

  uint8_t: number;
  uint16_t: number;
  uint32_t: number;
  uint64_t: number;

  int8_t: number;
  int16_t: number;
  int32_t: number;
  int64_t: number;

  float: number;
  double: number;

  void: unknown;
};

export type FfiType<K extends string> = K extends `${infer T}*`
  ? Ptr<FfiType<T>>
  : K extends keyof CommonFfiTypes ?
    CommonFfiTypes[K] :
    unknown;

export default ffi;

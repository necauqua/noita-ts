/** @noSelfInFile */

interface ScanParams {
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
  scan(needle: number | number[] | string, params?: ScanParams): number;

  /**
   * A shortcut for scan with a limit set to section length.
   * If you set params.limit to anything this is identical to calling scan.
   *
   * @param needle The pattern to search for
   * @param params Additional parameters to control the scan
   * @return The address where the pattern was found
   */
  scanAll(needle: number | number[] | string, params?: ScanParams): number;
}

declare const _default: {
  /** The `.data` memory address range */
  data: Section;
  /** The `.rdata` memory address range */
  rdata: Section;
  /** The `.text` memory address range */
  text: Section;

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
  scan(
    this: void,
    needle: number | number[] | string,
    params?: ScanParams,
  ): number;

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
   * `patchRaw(text.scan(...), ...)`.
   *
   * @param needle The pattern to search for
   * @param patch The bytes to write at that location
   * @param params Additional parameters to control the scan
   */
  patch(
    this: void,
    needle: number | number[] | string,
    patch: number[] | string,
    params?: ScanParams,
  ): void;

  /// LUAJIT FFI (because tstl one is lacking):

  cdef(this: void, cdefs: string): void;

  cast<K extends keyof CommonFfiTypes>(
    this: void,
    type: K,
    ptr: any,
  ): CommonFfiTypes[K];
  cast<T>(this: void, type: string, ptr: any): T;

  C: Record<string, any>;
};

export type Ptr<T> = {
  [offset: number]: T;
};

type CommonFfiTypes = {
  "uint8_t*": Ptr<number>;
  "uint16_t*": Ptr<number>;
  "uint32_t*": Ptr<number>;
  "uint64_t*": Ptr<number>;

  "int8_t*": Ptr<number>;
  "int16_t*": Ptr<number>;
  "int32_t*": Ptr<number>;
  "int64_t*": Ptr<number>;
};

export default _default;

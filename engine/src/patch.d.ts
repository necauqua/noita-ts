/**
 * Attempts to patch a location in memory
 *
 * @param location The memory address to patch
 * @param expect The expected bytes at that location (before patching)
 * @param patch_bytes The bytes to write at that location
 * @return Whether the patch was applied successfully and an error message if the patch failed
 */
export default function patchLocation(
  this: void,
  location: number,
  expect: number[] | string,
  patch: number[] | string,
): LuaMultiReturn<[boolean, string | undefined]>;

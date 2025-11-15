/**
 * Locates the vftable static memory address for a given RTTI name.
 *
 * @param name The RTTI name to locate the vftable for
 * @return A memory address of the vftable or undefined if not found
 */
export function locateVftable(this: void, name: string): number | undefined;

/**
 * Locates the address of a static global that uses a vftable with the
 * given RTTI name.
 *
 * @param name The name of the static global to locate
 * @return A memory address of the static global or undefined if not found
 */
export function locateStaticGlobal(
  this: void,
  name: string,
): number | undefined;

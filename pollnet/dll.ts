import MOD_CONTEXT from "@noita-ts/ffi/mods";

/**
 * The pollnet library, loaded from the folder of the mod that ships it.
 *
 * `api.lua` cannot load it on its own: it is plain Lua, so it cannot reach
 * across packages for the lookup that a mod installed from the Steam Workshop
 * needs. The `@noita-ts-include` of the DLL itself stays in `api.lua`, next to
 * the declarations of what it exports.
 */
export default MOD_CONTEXT.loadDll(
  "lua_modules/@noita-ts/pollnet/dist/pollnet.dll",
);

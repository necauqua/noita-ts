import ffi, { Ptr } from ".";
import c from "./schema";

export type LuaState = Ptr<unknown>;
export type LuaCFunction = (state: LuaState) => number;

ffi.cdef("typedef int (*lua_CFunction)(void*);");
const luaCFunction = c.escape<LuaCFunction>("lua_CFunction", 4, 4);

export const GCfuncC = c.declare("GCfuncC", [
  // header
  c.field("nextgc", c.voidptr),
  c.field("marked", c.u8),
  c.field("gct", c.u8),
  // funcheader
  c.field("ffid", c.u8),
  c.field("nupvalues", c.u8),
  c.field("env", c.u32), // 32bit GCRef cuz noita
  c.field("gclist", c.u32),
  c.field("pc", c.voidptr),
  // f
  c.field("f", luaCFunction),
]);

export type GCfuncC = typeof GCfuncC.type;

/**
  * Extracts the native C function pointer from a LuaJIT C function value
  * (e.g. the Noita API globals)
  */
export const getLuaCFunc = (fn: Function): number => {
  const [addressText] = string.match(tostring(fn), "^function: 0x(%x+)$");
  const address = addressText && tonumber(addressText, 16);
  if (address === undefined) {
    throw "could not get the LuaJIT function object address";
  }
  return tonumber(ffi.cast("uint32_t", GCfuncC.ptr().cast(address).f))!;
};

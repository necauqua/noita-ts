
import ffi, { Ptr } from ".";

ffi.cdef(`
  typedef struct NativeString {
      union {
          char buf[16];
          char* ptr;
      };
      uint32_t len;
      uint32_t cap;
  } NativeString;
`)

export type NativeString = {
  /** Only safe to read if cap > 0xF */
  ptr: Ptr<number>,
  /** Only safe to read if cap <= 0xF */
  buf: number[],
  len: number;
  cap: number;

  size: LuaLengthMethod<number>
};


ffi.metatype('NativeString', {
  __tostring: (s: NativeString) => s.len != 0 ? ffi.string(s.cap <= 0xF ? s.buf : s.ptr, s.len) : "",
  __len: (s: NativeString) => s.len
})

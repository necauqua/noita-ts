
import ffi from ".";
import c from "./schema";

export const NativeString = c.declare('NativeString', [
  c.union(
    c.field("buf", c.u8.arr(16)),
    c.field("ptr", c.u8.ptr()),
  ),
  c.field("len", c.u32),
  c.field("cap", c.u32),
]);

ffi.metatype('NativeString', {
  __tostring: (s: NativeString) => s.len != 0 ? ffi.string(s.cap <= 0xF ? s.buf : s.ptr, s.len) : "",
  __len: (s: NativeString) => s.len
})

export type NativeString = c.infer<typeof NativeString>;

export const Vec2 = c.declare('Vec2', [
  c.field("x", c.f32),
  c.field("y", c.f32),
]);
export type Vec2 = c.infer<typeof Vec2>;

export const Vec2i = c.declare('Vec2i', [
  c.field("x", c.i32),
  c.field("y", c.i32),
]);
export type Vec2i = c.infer<typeof Vec2i>;

export const BooleanVec = c.declare('BooleanVec', [
  c.field("start", c.u8.ptr()),
  c.field("end", c.u8.ptr()),
  c.field("cap", c.u8.ptr()),
  c.field("len", c.u32),
]).augment<{ [index: number]: boolean | undefined; }>();

export type BooleanVec = c.infer<typeof BooleanVec>;

ffi.metatype('BooleanVec', {
  __index: (v: BooleanVec, key: any) => {
    if (typeof key == 'number' && key >= 0 && key < v.len) {
      const byteIdx = key >> 3;
      const mask = 1 << (key & 7);
      return (v.start[byteIdx] & mask) != 0;
    }
  },
  __newindex: (v: BooleanVec, key: any, value: boolean) => {
    if (typeof key == 'number') {
      if (key < 0 || key >= v.len) {
        return;
      }
      const byteIdx = key >> 3;
      const mask = 1 << (key & 7);
      if (value) {
        v.start[byteIdx] |= mask;
      } else {
        v.start[byteIdx] &= ~mask;
      }
    }
  },
    __len: (v: BooleanVec) => v.len,
});

// opaque vector that is just padding where we know its a vector of something
export const VoidVec = c.declare('VoidVec', [
  c.field("start", c.voidptr),
  c.field("end", c.voidptr),
  c.field("cap", c.voidptr),
]);

const vector_index = <T>(v: any, key: any): any => {
  if (typeof key === 'number' && key > 0 && key <= (v.end - v.start)) {
    return v.start[key - 1] as T;
  }
  if (key === 'getAll') {
    return <T>(self: any): T[] => {
      const result: T[] = [];
      if (!self.start || !self.end) {
        return result;
      }
      for (let i = 0; i < (self.end - self.start); i++) {
        result[i] = self.start[i - 1] as T;
      }
      return result;
    };
  }
};

const string_vector_index = (v: any, key: any): any => {
  if (typeof key === 'number' && key > 0 && key <= (v.end - v.start)) {
    return tostring(v.start[key - 1]);
  }
  if (key === 'getAll') {
    return (self: any): string[] => {
      const result: string[] = [];
      if (!self.start || !self.end) {
        return result;
      }
      for (let i = 0; i < (self.end - self.start); i++) {
        result[i] = tostring(self.start[i - 1]);
      }
      return result;
    };
  }
};

export const Vec = <T>(item: c.Type<T>) => {
  const type = c.declare(`${item.name}_Vec`, [
    c.field("start", item.ptr()),
    c.field("end", item.ptr()),
    c.field("cap", item.ptr()),
  ]);

  ffi.metatype(type.name, {
    __index: item.name === NativeString.name ? string_vector_index : vector_index,
    __newindex: (v: any, key: any, value: any) => {
      if (typeof key === 'number' && key >= 0 && key < (v.end - v.start)) {
        v.start[key] = value;
      }
    },
    __len: (v: any) => v.end - v.start,
  });

  return type.augment<{
    [index: number]: T | undefined;
    getAll?(): T[];
  }>();
};

export const IntVec = Vec(c.i32);
export const StringVec = Vec(NativeString);

export const Map = (key: c.Type<unknown>, value: c.Type<unknown>) => {
  const name = `${key.name}_${value.name}_Map`;

  const nodeRef = c.escape(`${name}_node`);
  const node = c.declare(nodeRef.name, [
    c.field("left", nodeRef.ptr()),
    c.field("up", nodeRef.ptr()),
    c.field("right", nodeRef.ptr()),
    c.unknown(c.u32, "meta"),
    c.field("key", key),
    c.field("value", value),
  ]);

  const type = c.declare(name, [
    c.field("root", node.ptr()),
    c.field("len", c.u32),
  ]);

  ffi.metatype(type.name, {
    __index: {
      // todo get assumes string keys 🤷
      get: (self: any, key: any) => {
        if (!self.root || !self.root.up) {
          return;
        }
        let node = self.root.up;
        while (node != undefined && node != self.root) {
          const nodeKey = tostring(node.key);
          if (key == nodeKey) {
            return node.value;
          } else if (key < nodeKey) {
            node = node.left;
          } else {
            node = node.right;
          }
        }
      },
      getAll: (self: any) => {
        const result: Record<string, number> = {};
        if (!self.root || !self.root.up) {
          return result;
        }
        const traverse = (node: any) => {
          if (!node || node == self.root) {
            return;
          }
          traverse(node.left);
          result[tostring(node.key)] = node.value;
          traverse(node.right);
        };
        traverse(self.root.up);
        return result;
      },
    },
    __len: (map: any) => map.len,
  });

  return type.augment<{
    get(key: string): number | undefined;
    getAll(): Record<string, number>;
  }>();
};

export const StringIntMap = Map(NativeString, c.i32);
export type StringIntMap = c.infer<typeof StringIntMap>;

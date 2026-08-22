import ffi from ".";
import c from "./schema";

/**
 * A C type paired with the TypeScript value that a container hands out for it -
 * the type-level half of `conversion`.
 *
 * The `ts` member is a phantom, holding no value at runtime, so the tag lives
 * on the type descriptor rather than on the modelled struct: a container looks
 * it up on the very object it was handed, instead of guessing from the shape
 * of the value, which any struct with the same fields would answer to.
 */
export type Converted<D, T> = D & { readonly ts: T };

/** The TypeScript value that a container of `D` reads out and hands over. */
export type Ts<D extends c.Type<any>> =
  D extends { readonly ts: infer T } ? T : D['type'];

type Conversion = (value: any) => any;

const conversions: Record<string, Conversion> = {};

const identity: Conversion = value => value;

/**
 * Registers how values of `type` are surfaced when read out of a container:
 * a vector element, a map key or a map value.
 *
 * The registration is returned as a `Converted` type, and only that tagged
 * type carries the conversion into the containers built out of it.
 */
export const conversion = <D extends c.Type<any>, T>(
  type: D,
  convert: (value: D['type']) => T,
): Converted<D, T> => {
  conversions[type.name] = convert;
  return type as Converted<D, T>;
};

const conversionOf = (type: c.Type<any>): Conversion =>
  conversions[type.name] ?? identity;

const nativeString = c.declare('NativeString', [
  c.union(
    c.field("buf", c.u8.arr(16)),
    c.field("ptr", c.u8.ptr()),
  ),
  c.field("len", c.u32),
  c.field("cap", c.u32),
]);

type NativeStringValue = typeof nativeString.type;

ffi.metatype('NativeString', {
  __tostring: (s: NativeStringValue) =>
    s.len != 0 ? ffi.string(s.cap <= 0xF ? s.buf : s.ptr, s.len) : "",
  __len: (s: NativeStringValue) => s.len,
});

/** `std::string`, which a container hands out as a plain string. */
export const NativeString = conversion(nativeString, s => tostring(s));

export const Vec2 = c.declare('Vec2', [
  c.field("x", c.f32),
  c.field("y", c.f32),
]);

export const Vec2i = c.declare('Vec2i', [
  c.field("x", c.i32),
  c.field("y", c.i32),
]);

/**
 * A C type name may contain `*`, `[N]` and spaces, none of which may appear in
 * the name of the struct generated for a container of that type.
 */
const identifier = (name: string): string => {
  const [pointers] = string.gsub(name, '%*', '_ptr');
  const [id] = string.gsub(pointers, '[^%w_]', '_');
  return id;
};

const generics: Record<string, unknown> = {};

/**
 * Memoizes a generic container type by its generated name - a C type may only
 * be declared once, and may only be given an `ffi.metatype` once, so asking
 * for `Vec(c.i32)` twice has to hand back the very same type.
 */
const generic = <T>(name: string, make: (name: string) => T): T => {
  let type = generics[name];
  if (type === undefined) {
    type = make(name);
    generics[name] = type;
  }
  return type as T;
};

/** `std::vector<bool>`, whose elements are single bits rather than values. */
export const BooleanVec = c.declare('BooleanVec', [
  c.field("start", c.u8.ptr()),
  c.field("end", c.u8.ptr()),
  c.field("cap", c.u8.ptr()),
  c.field("len", c.u32),
]).augment<{
  [index: number]: boolean | undefined;
  getAll(this: any): boolean[];
}>();

type Bits = typeof BooleanVec.type;

const booleanVecMethods = {
  getAll: (self: Bits): boolean[] => {
    const result: boolean[] = [];
    for (let i = 0; i < self.len; i++) {
      result[i] = (self.start[i >> 3] & (1 << (i & 7))) != 0;
    }
    return result;
  },
} as Record<string, unknown>;

ffi.metatype('BooleanVec', {
  __index: (v: Bits, key: any) => {
    if (typeof key != 'number') {
      return booleanVecMethods[key];
    }
    if (key >= 0 && key < v.len) {
      return (v.start[key >> 3] & (1 << (key & 7))) != 0;
    }
  },
  __newindex: (v: Bits, key: any, value: boolean) => {
    if (typeof key == 'number' && key >= 0 && key < v.len) {
      const byteIdx = key >> 3;
      const mask = 1 << (key & 7);
      if (value) {
        v.start[byteIdx] |= mask;
      } else {
        v.start[byteIdx] &= ~mask;
      }
    }
  },
  __len: (v: Bits) => v.len,
});

/** An opaque vector - padding of the right shape where the element type is unknown. */
export const VoidVec = c.declare('VoidVec', [
  c.field("start", c.voidptr),
  c.field("end", c.voidptr),
  c.field("cap", c.voidptr),
]);

/**
 * `std::vector<T>` for any `T` of a known layout - a primitive, a pointer or a
 * declared struct. Elements are indexed from zero and read through the
 * conversion registered for `T`, so a vector of `NativeString` hands out plain
 * strings.
 */
export const Vec = <D extends c.Type<any>>(item: D) => generic(`${identifier(item.name)}_Vec`, name => {
  const type = c.declare(name, [
    c.field("start", item.ptr()),
    c.field("end", item.ptr()),
    c.field("cap", item.ptr()),
  ]);

  const toTs = conversionOf(item);

  const count = (v: any): number => v.start ? tonumber(v.end - v.start)! : 0;

  const methods = {
    len: count,
    getAll: (self: any): Ts<D>[] => {
      const result: Ts<D>[] = [];
      for (let i = 0; i < count(self); i++) {
        result[i] = toTs(self.start[i]);
      }
      return result;
    },
  } as Record<string, unknown>;

  ffi.metatype(name, {
    __index: (v: any, key: any) => {
      if (typeof key != 'number') {
        return methods[key];
      }
      if (key >= 0 && key < count(v)) {
        return toTs(v.start[key]);
      }
    },
    __newindex: (v: any, key: any, value: any) => {
      if (typeof key === 'number' && key >= 0 && key < count(v)) {
        v.start[key] = value;
      }
    },
    __len: (v: any) => count(v),
  });

  return type.augment<{
    [index: number]: Ts<D> | undefined;
    len(this: any): number;
    getAll(this: any): Ts<D>[];
  }>();
});

// only a value a Lua table can be keyed by is usable as a `getAll` key
type MapKey<T> = T extends string | number ? T : string;

/** `_Redbl`, the colour of a `_Tree_node`. */
export const NodeColor = c.enumeration(c.u8, ['red', 'black']);

/**
 * `std::map<K, V>`, as laid out by MSVC: a red-black tree of `_Tree_node`s
 * hanging off a head node, which doubles as the sentinel every leaf points back
 * at - the one node with `isnil` set, holding the tree root as its `parent`.
 *
 * Keys and values are read through the conversions registered for them, and
 * lookup compares converted keys, so a `NativeString` key is searched for with
 * a plain string.
 */
export const Map = <K extends c.Type<any>, V extends c.Type<any>>(key: K, value: V) =>
  generic(`${identifier(key.name)}_${identifier(value.name)}_Map`, name => {
    const nodeRef = c.escape(`${name}_node`);
    const node = c.declare(nodeRef.name, [
      c.field("left", nodeRef.ptr()),
      c.field("parent", nodeRef.ptr()),
      c.field("right", nodeRef.ptr()),
      c.field("color", NodeColor),
      // _Isnil, set on the head node alone; the two bytes of padding that
      // follow are the alignment of the key
      c.field("isnil", c.bool),
      c.field("key", key),
      c.field("value", value),
    ]);

    const type = c.declare(name, [
      c.field("head", node.ptr()),
      c.field("len", c.u32),
    ]);

    const keyToTs = conversionOf(key);
    const valueToTs = conversionOf(value);

    ffi.metatype(name, {
      __index: {
        get: (self: any, wanted: any) => {
          if (!self.head) {
            return;
          }
          let current = self.head.parent;
          while (!current.isnil) {
            const nodeKey = keyToTs(current.key);
            if (wanted == nodeKey) {
              return valueToTs(current.value);
            }
            current = wanted < nodeKey ? current.left : current.right;
          }
        },
        getAll: (self: any) => {
          const result: Record<any, unknown> = {};
          if (!self.head) {
            return result;
          }
          const traverse = (current: any) => {
            if (current.isnil) {
              return;
            }
            traverse(current.left);
            result[keyToTs(current.key)] = valueToTs(current.value);
            traverse(current.right);
          };
          traverse(self.head.parent);
          return result;
        },
      },
      __len: (map: any) => map.len,
    });

    return type.augment<{
      get(this: any, key: Ts<K>): Ts<V> | undefined;
      getAll(this: any): Record<MapKey<Ts<K>>, Ts<V>>;
    }>();
  });

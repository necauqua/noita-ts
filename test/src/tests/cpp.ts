import ffi from "@noita-ts/ffi";
import { BooleanVec, Map, NativeString, NodeColor, Vec } from "@noita-ts/ffi/cpp";
import c from "@noita-ts/ffi/schema";
import { assert, assertEq, test } from "@noita-ts/base/test";

// the containers only need LuaJIT, but LuaJIT is what the game runs on, and a
// wrong layout here is exactly the kind of thing the engine tests catch

const IntVec = Vec(c.i32);
const StringVec = Vec(NativeString);
const IntFloatMap = Map(c.i32, c.f32);
const StringIntMap = Map(NativeString, c.i32);

/** Fills a `NativeString` in place, short-string-optimized. */
const setString = (s: typeof NativeString.type, value: string) => {
  assert(value.length <= 15, `'${value}' does not fit the inline buffer`);
  ffi.copy(s.buf, value);
  s.len = value.length;
  s.cap = 15;
};

/** A vector of `count` freshly zeroed elements, and the array behind it. */
const vector = <T>(vec: c.Type<T>, item: c.Type<unknown>, count: number) => {
  const array = ffi.new(`${item.name}[${Math.max(count, 1)}]`);
  const v = ffi.new(vec.name);
  if (count != 0) {
    v.start = array;
    v.end = array + count;
    v.cap = v.end;
  }
  return { v: v as T, array };
};

/**
 * A map holding `entries`, which have to be sorted by key, as a balanced tree
 * of nodes hanging off a head node that every leaf points back at.
 */
const map = <T, K, V>(
  m: c.Type<T>,
  entries: [K, V][],
  setKey: (node: any, key: K) => void,
  setValue: (node: any, value: V) => void,
): T => {
  const head = ffi.new(`${m.name}_node`);
  head.isnil = true;
  const build = (lo: number, hi: number): any => {
    if (lo > hi) {
      return head;
    }
    const mid = Math.floor((lo + hi) / 2);
    const node = ffi.new(`${m.name}_node`);
    setKey(node, entries[mid][0]);
    setValue(node, entries[mid][1]);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    node.parent = head;
    return node;
  };
  head.parent = build(0, entries.length - 1);

  const result = ffi.new(m.name);
  result.head = head;
  result.len = entries.length;
  return result as T;
};

test("a vector of a primitive is indexed from zero", () => {
  const { v, array } = vector(IntVec, c.i32, 5);
  for (let i = 0; i < 5; i++) {
    array[i] = (i + 1) * 10;
  }

  assertEq(v.len(), 5, "len");
  assertEq(v[0], 10, "first element");
  assertEq(v[4], 50, "last element");
  assertEq(v[5], undefined, "one past the end");
  assertEq(v[-1], undefined, "one before the start");
  assertEq(v.getAll().join(","), "10,20,30,40,50", "getAll");

  v[2] = 42;
  assertEq(array[2], 42, "the write reached the array");
});

test("an empty vector has no elements", () => {
  const { v } = vector(IntVec, c.i32, 0);
  assertEq(v.len(), 0, "len");
  assertEq(v[0], undefined, "first element");
  assertEq(v.getAll().length, 0, "getAll");
});

test("a vector of strings hands out plain strings", () => {
  const { v, array } = vector(StringVec, NativeString, 2);
  setString(array[0], "hello");
  setString(array[1], "world");

  assertEq(v[0], "hello", "first element");
  assertEq(v[1], "world", "second element");
  assertEq(v.getAll().join(" "), "hello world", "getAll");
});

test("a vector of pointers hands out pointers", () => {
  const PointerVec = Vec(NativeString.ptr());
  assertEq(PointerVec.name, "NativeString_ptr_Vec", "generated name");

  const { v, array } = vector(PointerVec, NativeString.ptr(), 1);
  const s = ffi.new(NativeString.name);
  setString(s, "pointed at");
  array[0] = s;

  // the conversion is tagged on `NativeString`, not on a pointer to one
  assertEq(tostring(v[0]![0]), "pointed at", "the string behind the pointer");
});

test("a container type is only ever built once", () => {
  assertEq(Vec(c.i32), IntVec, "Vec(c.i32)");
  assertEq(Map(c.i32, c.f32), IntFloatMap, "Map(c.i32, c.f32)");
});

test("declaring a C type twice with a different layout fails", () => {
  const first = c.declare("TestDuplicate", [c.field("x", c.i32)]);
  const again = c.declare("TestDuplicate", [c.field("x", c.i32)]);
  assertEq(again.size, first.size, "redeclaring the same layout is fine");

  const [ok] = pcall(() =>
    c.declare("TestDuplicate", [c.field("x", c.f64)]),
  );
  assertEq(ok, false, "a different layout throws");
});

test("an enumeration is a set of numbers of a chosen width", () => {
  assertEq(NodeColor.red, 0, "a name numbered from zero");
  assertEq(NodeColor.black, 1, "the next name");
  assertEq(NodeColor.size, 1, "the width of the byte it is stored in");

  const Kind = c.enumeration(c.i32, { none: 0, some: 7 });
  assertEq(Kind.some, 7, "a value of its own");
  assertEq(Kind.size, 4, "the width it was given");

  const [ok] = pcall(() => c.enumeration(c.u8, ["name"]));
  assertEq(ok, false, "a constant may not shadow a member of the type");
});

test("a struct lays out the way the C compiler does", () => {
  assertEq(ffi.sizeof(NativeString.name), NativeString.size, "NativeString");
  assertEq(ffi.sizeof(IntVec.name), IntVec.size, "int32_t_Vec");
  assertEq(ffi.sizeof(StringIntMap.name), StringIntMap.size, "map");
  assertEq(ffi.offsetof(NativeString.name, "len"), 16, "NativeString.len");
});

test("a map with primitive keys is looked up by value", () => {
  const m = map(
    IntFloatMap,
    [[1, 1.5], [2, 2.5], [3, 3.5]],
    (node, key) => (node.key = key),
    (node, value) => (node.value = value),
  );

  assertEq(m.get(1), 1.5, "first key");
  assertEq(m.get(2), 2.5, "middle key");
  assertEq(m.get(3), 3.5, "last key");
  assertEq(m.get(9), undefined, "missing key");
  assertEq(m.getAll()[2], 2.5, "getAll");
});

test("a map with string keys is looked up by string", () => {
  const m = map(
    StringIntMap,
    [["alpha", 1], ["beta", 2], ["gamma", 3]],
    (node, key) => setString(node.key, key),
    (node, value) => (node.value = value),
  );

  assertEq(m.get("alpha"), 1, "first key");
  assertEq(m.get("beta"), 2, "middle key");
  assertEq(m.get("gamma"), 3, "last key");
  assertEq(m.get("delta"), undefined, "missing key");
  assertEq(m.getAll()["gamma"], 3, "getAll");
});

test("an empty map holds nothing", () => {
  const m = map(IntFloatMap, [], () => { }, () => { });
  assertEq(m.get(1), undefined, "lookup");
  assertEq(m.getAll()[1], undefined, "getAll");
});

test("std::vector<bool> is indexed by bit", () => {
  const bits = ffi.new("uint8_t[2]");
  const v: typeof BooleanVec.type = ffi.new(BooleanVec.name);
  v.start = bits;
  v.end = bits + 2;
  v.cap = v.end;
  v.len = 12;

  bits[0] = 0b0000_0101;
  assertEq(v[0], true, "bit 0");
  assertEq(v[1], false, "bit 1");
  assertEq(v[2], true, "bit 2");
  assertEq(v[11], false, "bit 11");
  assertEq(v[12], undefined, "one past the end");

  v[9] = true;
  assertEq(bits[1], 0b0000_0010, "the write reached the bits");
  assertEq(v.getAll().length, 12, "getAll");
});

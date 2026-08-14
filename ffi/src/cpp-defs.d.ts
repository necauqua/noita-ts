import { Ptr } from ".";

export type NativeString = {
  // ptr: Ptr<number>,
  // buf: number[],
  len: number;
  cap: number;

  size: LuaLengthMethod<number>
};

export type NativeVector<T> = {
  start: Ptr<T>,
  end: Ptr<T>,
  end_cap: Ptr<T>,

  [idx: number]: T | undefined
  getAll(): T[],
  length: LuaLengthMethod<T>,
}

export type CppStringIntMap = {
  get(key: string): number | undefined;
  getAll(): Record<string, number>;
  size: LuaLengthMethod<number>;
};

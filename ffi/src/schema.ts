import ffi, { Ptr } from ".";

namespace c {
  /**
   * A C type of a known layout, along with the TypeScript type `T` that its
   * values are modelled as.
   *
   * Being a class rather than a bare object keeps the suffix functions on a
   * shared metatable, and lets inferred declaration types be printed by name -
   * inlining the recursive signatures below would blow up the emitted .d.ts.
   */
  export class Type<T> {
    readonly kind = 'declaration';

    /** The phantom carrier of `T` - it holds no value at runtime. */
    declare readonly type: T;

    constructor(
      readonly name: string,
      readonly size: number,
      readonly align: number,
      readonly definition?: string,
    ) { }

    /** `T` -> `T*`. */
    ptr(): Type<Ptr<T>> {
      return new Type(`${this.name}*`, 4, 4);
    }

    /** `T` -> `T[length]`. */
    arr(length: number): Type<T[]> {
      return new Type(`${this.name}[${length}]`, this.size * length, this.align);
    }
  }

  /**
   * A type whose values are handled through a pointer: a struct declaration,
   * or a pointer to one.
   *
   * LuaJIT dereferences one level of indirection on field access, so a `T*`
   * behaves exactly like the `T` it points at. That makes an address castable
   * straight to `T`, which a scalar type cannot offer - `ffi.cast` refuses a
   * struct type outright, and for a scalar there is nothing to dereference.
   */
  export class Ref<T> extends Type<T> {
    /** `T` -> `T*`, which is one more `*` for the auto-deref to eat. */
    override ptr(): Ref<Ptr<T>> {
      return new Ref(`${this.name}*`, 4, 4);
    }

    /** A shorthand for `ffi.cast<T>(this.name + '*', thing)`. */
    cast(thing: any): T {
      return ffi.cast<T>(`${this.name}*`, thing);
    }
  }

  /**
   * A struct declared through `c.declare` - the one kind of type that has
   * members of its own, and so the one kind worth augmenting.
   */
  export class Struct<T> extends Ref<T> {
    /**
     * Intersects the modelled type with `A`, leaving the C layout alone.
     *
     * Useful for tacking on members that the schema cannot express, such as
     * ones provided by an `ffi.metatype`.
     */
    augment<A>(): Struct<T & A> {
      return this as Struct<any>;
    }
  }

  type CppDeclaration<T> = Type<T>;

  type CppField<Name extends string, Type> = {
    readonly kind: 'field';
    readonly name: Name;
    readonly type: CppDeclaration<Type>;
  };

  type CppUnknown = {
    readonly kind: 'unknown';
    readonly value: number | CppDeclaration<unknown>;
    readonly name?: string;
  };

  type CppUnion<Members extends readonly CppEntry[]> = {
    readonly kind: 'union';
    readonly members: Members;
  };

  /** Anything that can sit inside a struct body, in declaration order. */
  type CppEntry =
    | CppField<string, any>
    | CppUnknown
    | CppUnion<readonly any[]>;

  type UnionToIntersection<U> =
    (U extends unknown ? (u: U) => void : never) extends (i: infer I) => void
      ? I
      : never;

  type Simplify<T> = { [K in keyof T]: T[K] } & {};

  // unknown entries produce `{}` rather than `unknown`, which would swallow
  // the whole intersection below
  type EntryType<E> =
    E extends CppField<infer Name, infer Type>
      ? { [K in Name]: Type }
      : E extends CppUnion<infer Members>
        ? InferFields<Members>
        : {};

  // union members are merged in, as C makes all of them equally accessible.
  // the entries are collapsed into a union of types first, so that the depth
  // of the instantiation does not grow with the number of fields
  type InferFields<Entries extends readonly CppEntry[]> =
    UnionToIntersection<EntryType<Entries[number]>>;

  export type infer<D> = D extends CppDeclaration<infer T> ? T : never;

  const alignTo = (offset: number, alignment: number) =>
    Math.ceil(offset / alignment) * alignment;

  const entryLayout = (entry: CppEntry): { size: number; align: number } => {
    if (entry.kind === 'field') {
      return entry.type;
    }
    if (entry.kind === 'unknown') {
      return typeof entry.value === 'number'
        ? { size: entry.value, align: 1 }
        : entry.value;
    }

    let size = 0;
    let align = 1;
    for (const member of entry.members) {
      const layout = entryLayout(member);
      size = Math.max(size, layout.size);
      align = Math.max(align, layout.align);
    }
    return { size: alignTo(size, align), align };
  };

  // C array declarators wrap the field name (`uint8_t buf[16];`), so the
  // `[N]` suffix carried by the type name is moved behind the field name
  const declarator = (typeName: string, fieldName: string): string => {
    const idx = typeName.indexOf('[');
    return idx === -1
      ? `${typeName} ${fieldName}`
      : `${typeName.slice(0, idx)} ${fieldName}${typeName.slice(idx)}`;
  };

  export const declare = <E extends readonly CppEntry[]>(name: string, entries: E, noCdef?: true): Struct<Simplify<InferFields<E>>> => {
    const render = (entry: CppEntry, offset: number, indent = '        '): string => {
      if (entry.kind === 'union') {
        return `${indent}union {\n${entry.members.map((member: CppEntry) => render(member, offset, `${indent}    `)).join('\n')}\n${indent}};`;
      }
      if (entry.kind === 'unknown') {
        const fieldName = `_${entry.name ?? "field"}_0x${offset.toString(16)}`;
        const typeName = typeof entry.value === 'number'
          ? `uint8_t[${entry.value}]`
          : entry.value.name;
        return `${indent}${declarator(typeName, fieldName)};`;
      }
      return `${indent}${declarator(entry.type.name, entry.name)};`;
    };

    let offset = 0;
    let align = 1;
    const fields: string[] = [];
    for (const entry of entries) {
      const layout = entryLayout(entry);
      offset = alignTo(offset, layout.align);
      fields.push(render(entry, offset));
      offset += layout.size;
      align = Math.max(align, layout.align);
    }
    const size = alignTo(offset, align);

    // the typedef comes first so that the struct body may reference its own
    // type, as self-referential structs (tree/list nodes) need
    const definition = `typedef struct ${name} ${name};\nstruct ${name} {\n${fields.join('\n')}\n};`;
    if (!noCdef) {
      ffi.cdef(definition);
    }
    return new Struct<Simplify<InferFields<E>>>(name, size, align, definition);
  };

  export const escape = <T>(name: string, size = 0, align = 1): Type<T> =>
    new Type<T>(name, size, align);

  export const bool = escape<boolean>('bool', 1, 1);
  export const i8 = escape<number>(`int8_t`, 1, 1);
  export const i16 = escape<number>(`int16_t`, 2, 2);
  export const i32 = escape<number>(`int32_t`, 4, 4);
  export const i64 = escape<number>(`int64_t`, 8, 8);

  export const u8 = escape<number>(`uint8_t`, 1, 1);
  export const u16 = escape<number>(`uint16_t`, 2, 2);
  export const u32 = escape<number>(`uint32_t`, 4, 4);
  export const u64 = escape<number>(`uint64_t`, 8, 8);

  export const f32 = escape<number>('float', 4, 4);
  export const f64 = escape<number>('double', 8, 8);

  // Noita is a 32-bit process.
  export const voidptr = escape<Ptr<unknown>>('void*', 4, 4);


  /** A named struct field - the entries of a declaration are ordered, as C is. */
  export const field = <Name extends string, T>(name: Name, type: CppDeclaration<T>): CppField<Name, T> =>
    ({ kind: 'field', name, type });

  /**
   * Storage whose meaning is unknown and which is omitted from the inferred
   * type. A number reserves raw bytes; a type preserves its C size/alignment.
   */
  export const unknown = (value: number | CppDeclaration<unknown>, name?: string): CppUnknown => {
    if (typeof value === 'number' && value <= 0) {
      throw new Error('unknown storage size must be positive');
    }
    return { kind: 'unknown', value, name };
  };

  /** An anonymous union of fields, which C lets you access through the parent. */
  export const union = <E extends readonly CppEntry[]>(...members: E): CppUnion<E> =>
    ({ kind: 'union', members });
}

export default c;

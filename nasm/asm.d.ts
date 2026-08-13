// Types for the inline `asm()` blocks assembled by `@noita-ts/nasm/asm-plugin`.
//
// A block's reloc and label names are parsed out of its source text at the type
// level, mirroring what `assemble.mjs` reads out of the object file.

/**
 * An inline x86 patch, assembled at build time by `@noita-ts/nasm/asm-plugin`.
 *
 * The source must be a constant string (a template literal with no
 * `${...}` substitutions): its bytes are baked at build time, and its
 * reloc and label names are read out of the text by the types below.
 *
 * ```ts
 * const patch = asm(`
 * target: reloc
 * entry:
 *     jmp [target]
 * `);
 * patch({ target: addr });
 * ```
 */
declare function asm<const Source extends string>(
  source: Source,
): asm.Patch<Source>;

declare namespace asm {
  /** Whitespace nasm ignores around a line. */
  type Space = ' ' | '\t' | '\r';

  /** Characters that cannot occur in a reloc or (top-level) label name. */
  type Punct =
    | Space
    | ','
    | '.' // a leading dot is a nasm sublabel, which the assembler skips
    | ':'
    | ';'
    | '['
    | ']'
    | '('
    | ')'
    | '+'
    | '-'
    | '*'
    | '"'
    | "'";

  type Trim<S extends string> = S extends `${Space}${infer R}`
    ? Trim<R>
    : S extends `${infer R}${Space}`
      ? Trim<R>
      : S;

  /** A line with its `;` comment (if any) cut off. */
  type Code<S extends string> = Trim<S extends `${infer L};${string}` ? L : S>;

  /** `S` if it is a plain name, else nothing — keeps expressions out. */
  type Name<S extends string> = S extends ''
    ? never
    : S extends `${string}${Punct}${string}`
      ? never
      : S;

  /** The declared name if the line is `name: reloc`, else nothing. */
  type RelocOn<S extends string> = Code<S> extends `${infer Label}:${infer Tail}`
    ? Trim<Tail> extends 'reloc'
      ? Name<Trim<Label>>
      : never
    : never;

  /** The defined name if the line is a label other than `name: reloc`. */
  type LabelOn<S extends string> = Code<S> extends `${infer Label}:${string}`
    ? [RelocOn<S>] extends [never]
      ? Name<Trim<Label>>
      : never
    : never;

  /**
   * Every name `On` finds over the lines of `S`.
   *
   * Accumulating into `Acc` instead of unioning the recursive result keeps
   * this a tail-recursive conditional type, so it is eliminated rather than
   * counted against the ~50 deep instantiation limit; lines with no `:` at
   * all skip `On` entirely, since neither form can match without one.
   */
  type NamesIn<
    S extends string,
    Acc,
    On extends Fn,
  > = S extends `${infer L}\n${infer R}`
    ? NamesIn<R, L extends `${string}:${string}` ? Acc | Apply<On, L> : Acc, On>
    : S extends `${string}:${string}`
      ? Acc | Apply<On, S>
      : Acc;

  /** A deferred line → names operation, instantiated by `Apply`. */
  interface Fn {
    line: string;
    out: unknown;
  }

  /** Instantiates the deferred `On` of `NamesIn` at one line. */
  type Apply<On extends Fn, Line extends string> = (On & { line: Line })['out'];

  interface OnReloc extends Fn {
    out: RelocOn<this['line']>;
  }

  interface OnLabel extends Fn {
    out: LabelOn<this['line']>;
  }

  /** Every name declared by a `name: reloc` line in `Source`. */
  type Relocs<Source extends string> = NamesIn<Source, never, OnReloc>;

  /** Every top-level label defined in `Source`. */
  type Labels<Source extends string> = NamesIn<Source, never, OnLabel>;

  /**
   * The values to link with: one per reloc, plus an optional `BASE`, which
   * a patch only has if it references its own labels absolutely (invisible
   * to this parser, hence always allowed).
   */
  type Values<Source extends string> = Record<Relocs<Source>, number> & {
    BASE?: number;
  };

  /**
   * `Values`, plus `never` for anything else `V` happens to carry.
   *
   * The argument's type has to be inferred (the result depends on whether it
   * has a `BASE`), and inference turns off the excess property check, so
   * unknown relocs are rejected by the constraint instead.
   */
  type Only<Source extends string, V> = Values<Source> &
    Record<Exclude<keyof V, Relocs<Source> | 'BASE'>, never>;

  /** With no relocs at all there is nothing to pass, so the argument is optional. */
  type Args<Source extends string, V> = [Relocs<Source>] extends [never]
    ? [values?: V]
    : [values: V];

  type Deferred = (this: void, base: number) => number[];

  /**
   * Linking is deferred only when no `BASE` is given, so a call that passes
   * one is always the finished bytes. Without it the result stays a union:
   * whether the patch needs a `BASE` at all cannot be seen from the source.
   */
  type Linked<V> = V extends { BASE: number } ? number[] : number[] | Deferred;

  interface Patch<Source extends string> {
    /** Raw x86 patch machine code; reloc fields are zeroed. */
    readonly raw: number[];
    /** Byte offsets of each reloc's 32-bit field within `raw`. */
    readonly vars: Record<Relocs<Source>, number[]> & { BASE?: number[] };
    /** Byte offset of each label within `raw`. */
    readonly labels: Record<Labels<Source>, number>;
    /**
     * Links the patch: a copy of `raw` with each reloc's value added
     * little-endian into every offset recorded for it in `vars`.
     *
     * Omitting `BASE` (the patch's own runtime address) yields a
     * function taking it and returning the linked bytes; `ffi.cave`
     * accepts that directly and supplies the cave address. Pass a `BASE`
     * and the result is just `number[]`.
     */
    <V extends Only<Source, V>>(this: void, ...args: Args<Source, V>): Linked<V>;
  }
}

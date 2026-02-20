/**
 * DISCLAIMER:
 * I don't really use nxml all that much and I didn't have any motivation to
 * write all of this manually, so this declaration file was entirely vibe-coded
 * with minimal fixups by feeding luaxml.lua to an LLM.
 *
 * Should be fine, but in case it isn't - that's why
 *
 * DISCLAIMER #2:
 * Since the first disclaimer, I went in and added everything related to
 * autocompletion via NxmlShapes, so if that one's not fine that's totally
 * on me then
 */

/** @noSelfInFile */

declare global {
  /**
   * You can use interface merging to add autocompletion hints similar to how
   * `@noita-ts/base` does so for all Noita components.
   */
  interface NxmlShapes {
    Base: { file: string };
    Entity: {
      name: string;
      tags: string;
    };
  }
}

type NxmlNames = (string & keyof NxmlShapes) | (string & {});

declare namespace nxml {
  /** A string that is could be autocompleted to one of the attributes of the given element */
  type AttrHint<N> =
    | (string & (N extends keyof NxmlShapes ? keyof NxmlShapes[N] : string))
    | (string & {});

  /** A record of attributes with keys that could be autocompleted to one of the attributes of the given element */
  type AttrHints<N> =
    | Record<
        N extends keyof NxmlShapes ? keyof NxmlShapes[N] : string,
        string | number | boolean
      >
    | Record<string, string | number | boolean>;

  /** A record of element: attribute-record pairs that could have both element and attribute names autocompleted */
  type XmlHints =
    | { [N in keyof NxmlShapes]: AttrHints<N> }
    | Record<string, Record<string, string | number | boolean>>;

  /** Represents an XML element node */
  interface XMLElement<N extends string = NxmlNames> {
    name: string;
    attr: Record<string, string>;
    children: XMLElement[];
    errors: any[];
    content?: string[];
    parent?: XMLElement;

    /**
     * Expands the Base files for an entity xml
     *
     * Returns `this` for chaining purposes.
     *
     * **WARN: This is not 100% identical to Nollas implementation, _remove_from_base does not work**
     */
    expand_base(
      read?: (path: string) => string,
      exists?: (path: string) => boolean,
    ): this;

    /**
     * Returns `this` for chaining purposes.
     */
    apply_defaults(defaults: { [name: string]: { [attr: string]: any } }): this;

    /**
     * Returns the content inside an element.
     *
     * Example: <Hi>Content</Hi>
     *
     * Here `text()` is "Content"
     */
    text(): string;

    /**
     * If you want to construct a new element and immediately add it use `create_child`.
     * This is useful for moving children around in the tree.
     * Returns `this` for chaining purposes.
     */
    add_child(child: XMLElement): this;

    /**
     * Returns `this` for chaining purposes.
     */
    add_children(children: XMLElement[]): this;

    /**
     * Creates a new element and adds it as a child to this element.
     * Convenience function that combines `add_child` with `nxml.new_element`.
     *
     * Example usage:
     *   ```typescript
     *   elem.create_child("LifetimeComponent", { lifetime: 30 })
     *   ```
     */
    create_child<N extends NxmlNames>(
      name: N,
      attrs?: AttrHints<N>,
      children?: XMLElement[],
    ): XMLElement<N>;

    /**
     * Creates several new elements and inserts them as children to this element.
     * Convenience function that combines add_children with nxml.new_element.
     *
     * Example usage:
     *   ```typescript
     *   elem.create_children(
     *     { AbilityComponent: { ui_name: "$item_jar_with_mat" } },
     *     { DamageModelComponent: { hp: 2 } }
     *   )
     *   ```
     */
    create_children(...children: Array<XmlHints>): this;

    /**
     * Removes the given child, note that this is exact equality not structural equality so copies will not be considered equal.
     * Returns `this` for chaining purposes.
     */
    remove_child(child: XMLElement): this;

    /**
     * Removes the given child, but adds its children to this element.
     * Returns `this` for chaining purposes.
     */
    lift_child(child: XMLElement): this;

    /**
     * Returns `this` for chaining purposes.
     */
    remove_child_at(index: number): this;

    /**
     * Returns `this` for chaining purposes.
     */
    clear_children(): this;

    /**
     * Returns `this` for chaining purposes.
     */
    clear_attrs(): this;

    /**
     * Returns the first child element with the given name and its index.
     */
    first_of<N extends NxmlNames>(
      element_name: N,
    ):
      | LuaMultiReturn<[XMLElement<N>, number]>
      | LuaMultiReturn<[undefined, undefined]>;

    /**
     * Returns the nth child element with the given name and its index.
     */
    nth_of<N extends NxmlNames>(
      element_name: N,
      n: number,
    ):
      | LuaMultiReturn<[XMLElement<N>, number]>
      | LuaMultiReturn<[undefined, undefined]>;

    /**
     * Iterate over each child with the given name, effectively a filter.
     * Note that this function will behave strangely if you mutate children while iterating.
     *
     * Example:
     *   ```typescript
     *   for (const dmc of entity.each_of("DamageModelComponent")) {
     *     dmc.set("hp", 5);
     *   }
     * ```
     */
    each_of<N extends NxmlNames>(element_name: N): LuaIterable<XMLElement<N>>;

    /**
     * Collects all children with the given name into an array.
     */
    all_of<N extends NxmlNames>(element_name: N): XMLElement<N>[];

    /**
     * Iterate over each child of the xml element.
     *
     * Example:
     *   ``` typescript
     *   for (const child of elem.each_child()) {
     *     console.log(child.name);
     *   }
     *   ```
     */
    each_child(): LuaIterable<XMLElement>;

    /**
     * Gets the given attribute, note get's value is probably stringified and not the true value.
     */
    get(attr: AttrHint<N>): string | undefined;

    /**
     * Sets the given attribute, make sure your type can be stringified. Returns `this` for chaining purposes.
     */
    set(attr: AttrHint<N>, value: string | number | boolean): this;

    /**
     * Deep clone of the element.
     */
    clone(): XMLElement;
  }

  type ErrorKind =
    | "missing_attribute_value"
    | "missing_element_close"
    | "missing_equals_sign"
    | "missing_element_name"
    | "missing_tag_open"
    | "mismatched_closing_tag"
    | "missing_token"
    | "missing_element"
    | "duplicate_attribute";

  let error_handler: ((kind: ErrorKind, msg: string) => void) | undefined;

  /**
   * Allows you to have an xml element which represents a file, with changes made in the xml element reflecting in the file when you exit the `edit_file()` scope.
   *
   * Example:
   *   ```typescript
   *   for (const content of nxml.edit_file("data/entities/animals/boss_centipede/boss_centipede.xml")) {
   *     content.first_of("DamageModelComponent").set("hp", 2);
   *   }
   *   // Kolmis file is edited once we exit the for loop
   *   ```
   */
  function edit_file(
    file: string,
    read?: (filename: string) => string,
    write?: (filename: string, content: string) => void,
  ): LuaIterable<XMLElement>;

  /**
   * Parses a file. This is noita specific as it uses `ModTextFileGetContent`, but if you pass your own read function you can use it in a standalone context.
   */
  function parse_file(
    file: string,
    read?: (filename: string) => string,
  ): XMLElement;

  /**
   * The primary nxml function, converts nxml source into an element.
   *
   * Note it is the content not the filename, use `nxml.parse_file()` to parse by filename.
   */
  function parse(xml: string): XMLElement;

  /**
   * This parses xml files with multiple base nodes, useful for biome xmls.
   *
   * Example file:
   *   ```typescript
   *   <A />
   *   <B />
   *   <C />
   *   ```
   */
  function parse_many(xml: string): XMLElement[];

  /**
   * Constructs an element with the given values, just a wrapper to set the metatable really.
   */
  function new_element<N extends NxmlNames>(
    name: N,
    attrs?: AttrHints<N>,
    children?: XMLElement[],
  ): XMLElement<N>;

  /**
   * Generally you should do `tostring(elem)` instead of calling this function.
   * This function is just how it's implemented and is exposed for more customisation.
   *
   * @param packed the string representation of the xml will be minimal if true
   * @param indent_char the character to use for indentation, default "\t"
   * @param cur_indent the current level of indentation, you probably don't want to change this
   */
  function tostring(
    xml: XMLElement,
    packed?: boolean,
    indent_char?: string,
    cur_indent?: string,
  ): string;
}

export default nxml;

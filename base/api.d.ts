/** @noSelfInFile */

declare namespace tags {
  const EntityId: unique symbol;
}
declare type EntityID = number & { readonly [tags.EntityId]: unique symbol };

declare function GameGetWorldStateEntity(): EntityID | null;
declare function GamePrint(text: string): void;

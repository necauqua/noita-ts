/// <reference types="@noita-ts/base/types" />

import ffi, { Ptr } from "..";
import { NativeString, Vec, Vec2 } from "../cpp";
import { getLuaCFunc } from "../luajit";
import c from "../schema";

const EntityTransform = c.declare("EntityTransform", [
  c.field("pos", Vec2),
  c.field("rotation", Vec2),
  c.field("rot90", Vec2),
  c.field("scale", Vec2),
]);

const EntityTags = c.declare("EntityTags", [
  c.field("bits", c.u32.arr(16)),
]);

export interface Entity {
  id: number;
  component_store_idx: number;
  filename_idx: number;
  state: number;
  name: typeof NativeString.type;
  tags: typeof EntityTags.type;
  transform: typeof EntityTransform.type;
  children: Ptr<typeof EntityVec.type>;
  parent: Ptr<Entity>;
 }

 // A struct tag may be referenced before its body is declared, which makes the
 // parent pointer and vector elements genuinely self-referential.
const EntityRef = c.escape<Entity>("struct Entity");
const EntityVec = Vec(EntityRef.ptr());

 /** The native entity object returned by EntityManager::get_entity. */
export const Entity = c.declare("Entity", [
  c.field("id", c.u32),
  c.field("component_store_idx", c.u32),
  c.field("filename_idx", c.u32),
  c.field("state", c.i32),
  c.unknown(4),
  c.field("name", NativeString),
  c.unknown(4),
  c.field("tags", EntityTags),
  c.field("transform", EntityTransform),
  c.field("children", EntityVec.ptr()),
  c.field("parent", EntityRef.ptr()),
]);

// EntityGetIsAlive loads the manager global, then passes the looked-up id to
// the resolver: mov ecx, [entityManager] ; add esp, 8 ; push eax ; call get_entity
const getEntityCall = ffi.text.scan([0x83, 0xC4, 0x08, 0x50, 0xE8], {
  at: getLuaCFunc(EntityGetIsAlive),
  name: "EntityManager get_entity call in EntityGetIsAlive",
});

// the mov ecx sits right before the cleanup, so its disp32 is the manager global
const entityManager = ffi.cast("uint32_t*", getEntityCall - 4)[0];

// the resolver is thiscall'd with the entity id as its only argument
const getEntityNative = ffi.cast<(manager: Ptr<EntityManager>, id: EntityID) => Ptr<Entity>>(
  "Entity* (__thiscall *)(void*, int)",
  getEntityCall + 9 + ffi.cast("int32_t*", getEntityCall + 5)[0],
);

export const EntityManager = c.declare("EntityManager", [
  c.field("vftable", c.voidptr),
  c.field("next_entity_id", c.u32),
  c.field("free_ids", Vec(c.u32)),
  c.field("entities", EntityVec),
  c.field("entity_tag_buckets", Vec(EntityVec)),
  c.field("component_types", Vec(c.voidptr)),
  c.field("event_manager", c.voidptr),
]).metatype(class {
  getEntity(id: EntityID): Ptr<Entity> | undefined {
    const entity = getEntityNative(EntityManager.ptr().cast(this), id);
    return entity != null ? entity : undefined;
  }
});
export type EntityManager = typeof EntityManager.type;

const ENTITY_MANAGER = EntityManager.ptr().ptr().cast(entityManager);

export namespace ENTITY_MANAGER { }
export default ENTITY_MANAGER;

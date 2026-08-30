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

const locate = () => {
  let at = getLuaCFunc(EntityGetIsAlive);

  // EntityGetIsAlive loads the manager global immediately before calling the
  // internal resolver. Both addresses are found from that stable code path.
  for (let skip = 0; skip < 8; skip++) {
    const managerLoad = ffi.text.scanAll([0x8B, 0x0D], {
      at,
      limit: 0x400,
      name: "EntityManager global load in EntityGetIsAlive",
    });
    const code = ffi.cast("uint8_t*", managerLoad);
    const entityManager = ffi.cast("uint32_t*", managerLoad + 2)[0];

    if (
      entityManager >= ffi.data.offset &&
      entityManager < ffi.data.offset + ffi.data.len &&
      code[6] === 0x83 &&
      code[7] === 0xC4 &&
      code[8] === 0x08 &&
      code[9] === 0x50 &&
      code[10] === 0xE8
    ) {
      const relative = ffi.cast("int32_t*", managerLoad + 11)[0];
      return {
        entityManager,
        getEntityNative: ffi.cast<(manager: Ptr<unknown>, id: EntityID) => Ptr<Entity>>(
          "Entity* (__thiscall *)(void*, int)",
          managerLoad + 15 + relative,
        ),
      };
    }

    at = managerLoad + ffi.instrLen(managerLoad);
  }

  throw "Failed to scan EntityGetIsAlive for EntityManager global and calls";
};

const {entityManager, getEntityNative} = locate();

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
    const entity = getEntityNative(ffi.cast("void*", this), id);
    return entity != null ? entity : undefined;
  }
});

const ENTITY_MANAGER = EntityManager.ptr().ptr().cast(entityManager);

export namespace ENTITY_MANAGER { }
export default ENTITY_MANAGER;

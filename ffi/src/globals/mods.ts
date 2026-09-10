/// <reference types="@noita-ts/base/types" />

import { MOD_ID } from "$mod";
import ffi from "..";
import { NativeString, Vec, VoidVec } from "../cpp";
import c from "../schema";

/**
 * A mod that Noita has loaded, an entry of `ModContext::loaded_mods`.
 *
 * The first entry stands for the game itself: its `id` is empty and its
 * `script_path` is `data/scripts`.
 */
export const Mod = c.declare("Mod", [
  c.field("id", NativeString),
  c.field("enabled", c.u32),
  c.field("enabled2", c.u32),
  /** `mods/<id>`, the virtual path, even for a mod installed from the Workshop. */
  c.field("script_path", NativeString),
  c.field("lua_manager", c.voidptr),
  c.field("filesystem_device", c.voidptr),
  c.field("unsafe", c.bool),
  /**
   * The folder Steam downloaded the Workshop item into - an absolute path with
   * backslashes, as `ISteamUGC::GetItemInstallInfo` hands it over. Empty for a
   * mod that lives in the `mods/` folder of the game.
   */
  c.field("workshop_path", NativeString),
  c.unknown(4),
]);
export type Mod = typeof Mod.type;

const ModVec = Vec(Mod);
const StringVec = Vec(NativeString);

/**
 * The one global mod manager of the game, which holds every loaded mod along
 * with the place it was loaded from.
 *
 * Its `loaded_mods` are filled in before any mod runs its `init.lua`, so a mod
 * always finds itself in there.
 */
export const ModContext = c.declare("ModContext", [
  c.field("vftable", c.voidptr),
  c.unknown(VoidVec, "first_strings"),
  c.unknown(VoidVec, "mod_configs"),
  c.field("loaded_mods", ModVec),
  c.unknown(VoidVec, "read_mods"),
  c.unknown(VoidVec, "game_mode_mod_configs"),
  c.unknown(4),
  c.unknown(4),
  c.unknown(8, "lua_managers_by_path"),
  c.unknown(8, "lua_appends"),
  c.field("magic_number_appends", StringVec),
  c.field("materials_file_appends", StringVec),
  c.unknown(4),
  c.unknown(4, "mod_settings"),
  c.unknown(4, "mod_settings_len"),
  c.unknown(1),
  c.field("outside_init_2", c.bool),
  c.field("mod_init_errors", StringVec),
  /** The mod whose Lua the game is calling right now, null the rest of the time. */
  c.field("current_mod", Mod.ptr()),
  c.field("outside_init_1", c.bool),
  c.unknown(27),
]).metatype(class {

  /** The mod whose Lua the game is calling right now, if it is calling one. */
  current(): Mod | undefined {
    const mod = ModContext.ptr().cast(this).current_mod;
    return mod != undefined ? mod[0] : undefined;
  }

  /** The loaded mod of that id, or nothing when no mod of that id is loaded. */
  get(id: string): Mod | undefined {
    const mods = ModContext.ptr().cast(this).loaded_mods;
    for (let i = 0; i < mods.len(); i++) {
      const mod = mods.start[i];
      if (tostring(mod.id) == id) {
        return mod;
      }
    }
  }

  /**
   * The folder a mod really sits in on disk, which is what a call that goes
   * around the virtual file system of the game - `ffi.load` above all - needs.
   *
   * That is the Workshop folder for a mod installed from the Workshop, and
   * `mods/<id>` for a mod in the folder of the game. The path carries no
   * trailing separator.
   *
   * @param id The mod to look up, the mod of the caller by default
   * @return The folder of the mod
   */
  path(id?: string): string {
    const modId = id ?? MOD_ID;
    const mod = this.get(modId);
    const workshop = mod != undefined ? tostring(mod.workshop_path) : "";
    return workshop != "" ? workshop : `mods/${modId}`;
  }

  /**
   * Loads a DLL that ships inside a mod, given its path relative to the folder
   * of that mod.
   *
   * The `mods/` folder is tried first, as that is where a mod normally lives
   * and the lookup below costs a few scans of the memory of the game; a mod
   * installed from the Workshop falls back to `path`.
   *
   * @param path The path of the DLL relative to the folder of the mod
   * @param id The mod that ships it, the mod of the caller by default
   * @return The namespace of the loaded library
   */
  loadDll(path: string, id?: string): Record<string, any> {
    const modId = id ?? MOD_ID;
    const [ok, lib] = pcall(ffi.load, `mods/${modId}/${path}`);
    return ok
      ? lib as Record<string, any>
      : ffi.load(`${this.path(modId)}/${path}`);
  }
});
export type ModContext = typeof ModContext.type;

const MOD_CONTEXT = ModContext.ptr().cast(ffi.locateStaticGlobal(".?AUModContext@@"));

export namespace MOD_CONTEXT { }
export default MOD_CONTEXT;

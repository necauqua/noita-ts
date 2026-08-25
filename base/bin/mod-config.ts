import fs from "fs";
import path from "path";

/** An empty mod list, for an instance that has never had one. */
const EMPTY = "<Mods></Mods>";

/**
 * Switches mods on in save00/mod_config.xml, leaving the rest of it alone.
 *
 * A mod already listed keeps its place, and so its load order and its
 * settings; anything not listed yet is added at the end, enabled.
 */
export function enableMods(localNoita: string, ids: string[]) {
  const save00 = path.resolve(localNoita, "save00");
  const modConfigPath = path.resolve(save00, "mod_config.xml");

  let modConfig;
  try {
    modConfig = fs.readFileSync(modConfigPath, "utf-8");
  } catch {
    modConfig = EMPTY;
  }
  const previous = modConfig;

  for (const id of ids) {
    modConfig = enableMod(modConfig, id);
  }

  if (modConfig !== previous) {
    fs.mkdirSync(save00, { recursive: true });
    fs.writeFileSync(modConfigPath, modConfig);
  }
}

/** Enables one mod in the mod_config.xml contents, adding it if it is new. */
export function enableMod(modConfig: string, id: string): string {
  // the attributes come in a fixed order, and a mod id is a bare word, so
  // finding the entry is a matter of looking for the name that follows
  const listed = new RegExp(`enabled="[01]"(\\s+name="${escape(id)}")`);
  if (listed.test(modConfig)) {
    return modConfig.replace(listed, 'enabled="1"$1');
  }

  const entry = `<Mod enabled="1" name="${id}" settings_fold_open="0" workshop_item_id="0" />`;
  return modConfig.includes("</Mods>")
    ? modConfig.replace("</Mods>", `${entry}\n</Mods>`)
    : `<Mods>${entry}</Mods>`;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

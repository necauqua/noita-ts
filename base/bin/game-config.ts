import fs from "fs";
import path from "path";
import { findNoitaSaveDir } from "./steam.js";

/**
 * The config attributes the instance needs, whatever the copied config says.
 *
 * They get the game past the mod disclaimer and the changelog popup, and the
 * version hash matches the `_version_hash.txt` written next to the executable.
 */
const FORCED = {
  mods_disclaimer_accepted: "1",
  mods_sandbox_enabled: "0",
  mods_sandbox_warning_done: "1",
  last_started_game_version_hash: "static",
};

/** The config of an instance that has nothing to copy the settings from. */
export const DEFAULT_CONFIG =
  "<Config\r\n" +
  '  config_format_version="14" \r\n' +
  Object.entries(FORCED)
    .map(([name, value]) => `  ${name}="${value}" \r\n`)
    .join("") +
  "/>\r\n";

/** Sets the attributes the instance needs on the root tag of a config.xml. */
export function forceConfigAttributes(config: string): string {
  const tag = /<Config\b([^>]*?)(\/?)>/.exec(config);
  if (!tag) {
    console.warn("The copied config has no Config tag, using the default one");
    return DEFAULT_CONFIG;
  }
  let attributes = tag[1];
  for (const [name, value] of Object.entries(FORCED)) {
    const existing = new RegExp(`\\b${name}="[^"]*"`);
    if (existing.test(attributes)) {
      attributes = attributes.replace(existing, `${name}="${value}"`);
    } else {
      attributes += `  ${name}="${value}" \r\n`;
    }
  }
  return (
    config.slice(0, tag.index) +
    `<Config${attributes}${tag[2]}>` +
    config.slice(tag.index + tag[0].length)
  );
}

/**
 * Writes save_shared/config.xml of the instance, taking the settings and the
 * keybinds of the player from the real Noita save folder when there is one.
 */
export function setupConfig(noitaDir: string, saveShared: string) {
  const saveDir = findNoitaSaveDir(noitaDir);
  const source = saveDir && path.resolve(saveDir, "save_shared", "config.xml");
  let config;
  if (source && fs.existsSync(source)) {
    console.log(`Copying the config from ${source}`);
    config = forceConfigAttributes(fs.readFileSync(source, "utf-8"));
  } else {
    console.log("No Noita config of your own was found, using the default one");
    config = DEFAULT_CONFIG;
  }
  fs.mkdirSync(saveShared, { recursive: true });
  fs.writeFileSync(path.resolve(saveShared, "config.xml"), config);
}

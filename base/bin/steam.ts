import fs from "fs";
import path from "path";
import {
  findSteamAppSync,
  SteamAppNotFoundError,
  SteamNotFoundError,
} from "steam-locate";

/** Locates the install directory of a Steam app, or exits with a message. */
export function findSteamApp(name: string, id: string): string {
  let app;
  try {
    app = findSteamAppSync(id);
  } catch (e) {
    if (e instanceof SteamNotFoundError) {
      console.error("Steam is not installed or is unable to be found.");
      process.exit(1);
    }
    if (e instanceof SteamAppNotFoundError) {
      console.error(`${name} is not installed in Steam.`);
      process.exit(1);
    }
    throw e;
  }
  const { isInstalled, installDir } = app;
  if (!isInstalled || !installDir) {
    console.error(`${name} is not installed in Steam.`);
    process.exit(1);
  }
  console.log(`Found a Steam installation of ${name} at ${installDir}`);
  return installDir;
}

/** Locates the Noita installation. */
export const findNoita = () => findSteamApp("Noita", "881100");

/**
 * Locates the folder Noita keeps the saves and the config of the player in,
 * given the installation directory, or nothing when there is no such folder.
 *
 * On Windows it is a fixed spot under AppData. Everywhere else Noita runs
 * through Proton, which puts that spot inside the prefix of the Steam library
 * the game is installed in.
 */
export function findNoitaSaveDir(noitaDir: string): string | undefined {
  let localLow;
  if (process.platform === "win32") {
    const appData = process.env.APPDATA;
    if (!appData) {
      return undefined;
    }
    localLow = path.resolve(appData, "..", "LocalLow");
  } else {
    // the installation directory is <library>/steamapps/common/Noita
    const library = path.resolve(noitaDir, "..", "..", "..");
    localLow = path.resolve(
      library,
      "steamapps",
      "compatdata",
      "881100",
      "pfx",
      "drive_c",
      "users",
      "steamuser",
      "AppData",
      "LocalLow",
    );
  }
  const saveDir = path.resolve(localLow, "Nolla_Games_Noita");
  return fs.existsSync(saveDir) ? saveDir : undefined;
}

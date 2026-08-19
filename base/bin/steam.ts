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

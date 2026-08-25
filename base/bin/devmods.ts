import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { unzipSync } from "fflate";
import { enableMods } from "./mod-config.js";
import { connect, type Client } from "./workshop.js";

/** A tool that lives on Noita's Workshop. */
type WorkshopMod = {
  name: string;
  workshopId: string;
};

/** A tool that is published as a GitHub release. */
type ReleaseMod = {
  name: string;
  /** The `owner/name` of the repository to take the latest release of. */
  repo: string;
  /** Which of the release's assets holds the mod. */
  asset: RegExp;
  /** The folders in that archive that are mods. */
  folders: string[];
};

type DevMod = WorkshopMod | ReleaseMod;

const isWorkshopMod = (mod: DevMod): mod is WorkshopMod => "workshopId" in mod;

/**
 * The tools installed into a new instance alongside the mod being worked on.
 *
 * This order is the load order Noita gets, and it matters: Dear ImGui defines
 * the `load_imgui` that Component Explorer refuses to start without, and the
 * unsafe explorer runs Component Explorer's own files.
 */
export const DEV_MODS: DevMod[] = [
  {
    name: "Noita Dear ImGui",
    repo: "dextercd/Noita-Dear-ImGui",
    asset: /^NoitaDearImGui-.*\.zip$/,
    folders: ["NoitaDearImGui"],
  },
  { name: "Component Explorer", workshopId: "3073419779" },
  {
    // Component Explorer stands aside for this one when it is enabled, and it
    // is the half that can touch the things the Lua API otherwise hides.
    name: "Unsafe Explorer",
    repo: "dextercd/Noita-Component-Explorer",
    asset: /^UnsafeExplorer\.zip$/,
    folders: ["unsafe-explorer"],
  },
  { name: "Spell Lab Shugged", workshopId: "3284126816" },
];

/** The bits of the item state ISteamUGC reports that matter here. */
const SUBSCRIBED = 1;
const INSTALLED = 4;

/** How long to wait for Steam to hand over an item before giving up. */
const DOWNLOAD_TIMEOUT_MS = 180_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Downloads a Workshop item without subscribing the current Steam account. */
async function download(client: Client, mod: WorkshopMod) {
  const { workshopId, name } = mod;
  const id = BigInt(workshopId);
  if (client.workshop.state(id) & INSTALLED) {
    return;
  }

  if (!client.workshop.download(id, true)) {
    throw new Error(
      `Steam would not start the download of ${id} - the item may have been ` +
        "taken off the Workshop.",
    );
  }

  const deadline = Date.now() + DOWNLOAD_TIMEOUT_MS;
  while (!(client.workshop.state(id) & INSTALLED)) {
    if (Date.now() > deadline) {
      throw new Error(`Steam did not finish downloading ${id}.`);
    }
    const progress = client.workshop.downloadInfo(id);
    if (progress && progress.total > 0n) {
      const percent = (Number(progress.current) / Number(progress.total)) * 100;
      process.stdout.write(`\r  ${name}: ${percent.toFixed(0)}%`);
    }
    await sleep(250);
  }
  process.stdout.write("\r\x1b[K");
}

/** Reads the id Noita knows a mod by, which is not its Workshop folder name. */
function readModId(folder: string): string {
  const modId = fs
    .readFileSync(path.resolve(folder, "mod_id.txt"), "utf-8")
    .trim();
  if (!modId) {
    throw new Error("its mod_id.txt is empty, so Noita cannot name it.");
  }
  return modId;
}

/** Copies a downloaded Workshop item into the new instance. */
async function installWorkshopMod(
  localNoita: string,
  client: Client,
  mod: WorkshopMod,
): Promise<string[]> {
  const id = BigInt(mod.workshopId);
  const state = client.workshop.state(id);
  const wasSubscribed = Boolean(state & SUBSCRIBED);
  let workshopFolder: string | undefined;

  try {
    await download(client, mod);

    const info = client.workshop.installInfo(id);
    if (!info) {
      throw new Error("Steam reports it as installed nowhere.");
    }
    workshopFolder = info.folder;

    const modId = readModId(info.folder);
    const dest = path.resolve(localNoita, "mods", modId);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(info.folder, dest, { recursive: true });
    console.log(`  installed ${mod.name} as ${modId}`);
    return [modId];
  } finally {
    if (!wasSubscribed && workshopFolder) {
      fs.rmSync(workshopFolder, { recursive: true, force: true });
    }
  }
}

type Release = {
  tag_name: string;
  assets: Array<{ name: string; browser_download_url: string }>;
};

/** Asks GitHub for the newest release of a repository. */
async function latestRelease(repo: string): Promise<Release> {
  const response = await fetch(
    `https://api.github.com/repos/${repo}/releases/latest`,
    { headers: { accept: "application/vnd.github+json" } },
  );
  if (!response.ok) {
    throw new Error(
      `GitHub answered ${response.status} ${response.statusText} when asked ` +
        "for the latest release.",
    );
  }
  return response.json() as Promise<Release>;
}

/** Unpacks the wanted folders of a release archive into the instance. */
function unpack(localNoita: string, archive: Uint8Array, folders: string[]) {
  const mods = path.resolve(localNoita, "mods");
  const wanted = (name: string) =>
    folders.some((folder) => name.startsWith(`${folder}/`));
  const files = unzipSync(archive, {
    filter: ({ name }) => wanted(name) && !name.endsWith("/"),
  });

  for (const [name, contents] of Object.entries(files)) {
    const dest = path.resolve(mods, name);
    if (!dest.startsWith(`${mods}${path.sep}`)) {
      throw new Error(`it tries to write ${name} outside the mods folder.`);
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, contents);
  }
}

/** Downloads a mod published as a GitHub release into the new instance. */
async function installReleaseMod(
  localNoita: string,
  mod: ReleaseMod,
): Promise<string[]> {
  const release = await latestRelease(mod.repo);
  const asset = release.assets.find(({ name }) => mod.asset.test(name));
  if (!asset) {
    throw new Error(
      `its ${release.tag_name} release has no asset matching ${mod.asset}`,
    );
  }

  console.log(`  downloading ${mod.name} ${release.tag_name}...`);
  const response = await fetch(asset.browser_download_url);
  if (!response.ok) {
    throw new Error(
      `GitHub answered ${response.status} ${response.statusText} for ${asset.name}.`,
    );
  }

  unpack(localNoita, new Uint8Array(await response.arrayBuffer()), mod.folders);
  console.log(`  installed ${mod.name} as ${mod.folders.join(", ")}`);
  return mod.folders;
}

/** Installs and enables each tool independently so one failure does not hide the rest. */
async function installAll(localNoita: string): Promise<boolean> {
  const installed: string[] = [];
  let client: Client | undefined;
  let complete = true;

  for (const mod of DEV_MODS) {
    try {
      installed.push(
        ...(isWorkshopMod(mod)
          ? await installWorkshopMod(localNoita, (client ??= connect()), mod)
          : await installReleaseMod(localNoita, mod)),
      );
    } catch (error) {
      complete = false;
      const reason = error instanceof Error ? error.message : error;
      console.warn(`  could not install ${mod.name}: ${reason}`);
    }
  }

  if (installed.length > 0) {
    enableMods(localNoita, installed);
  }
  return complete;
}

/**
 * Installs the development tools into a newly created Noita instance.
 *
 * The work happens in a child process because steamworks.js offers no way to
 * disconnect: whoever talks to Steam holds the connection until they exit, and
 * this process goes on to launch Noita, which wants that connection itself.
 */
export function installDevMods(localNoita: string) {
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(import.meta.url), localNoita],
    { stdio: "inherit" },
  );
  if (result.error || result.status !== 0) {
    console.warn(
      "Warning: could not install all of the dev mods; carrying on without them.",
    );
  }
}

// installDevMods spawns this same file as its child, which exits after Steam is
// finished so that Noita can take over the connection.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const localNoita = process.argv[2];
  if (!localNoita) {
    console.error("usage: devmods.js <noita instance directory>");
    process.exit(2);
  }
  try {
    process.exit((await installAll(localNoita)) ? 0 : 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

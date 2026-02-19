#!/usr/bin/env node

import { spawnSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import {
  findSteamAppSync,
  SteamAppNotFoundError,
  SteamNotFoundError,
} from "steam-locate";
import syncDirectory from "sync-directory";
import * as jsonc from "jsonc-parser";
import NoitaMod from "./mod.js";

function findSteamApp(name: string, id: string): string {
  let noita;
  try {
    noita = findSteamAppSync(id);
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
  const { isInstalled, installDir } = noita;
  if (!isInstalled || !installDir) {
    console.error(`${name} is not installed in Steam.`);
    process.exit(1);
  }
  console.log(`Found a Steam installation of ${name} at ${installDir}`);
  return installDir;
}

function setupNoitaInstance(dir: string) {
  const noitaDir = findSteamApp("Noita", "881100");
  const startTime = performance.now();

  syncDirectory(noitaDir, dir, {
    include: (f: string) => {
      const rel = path.relative(noitaDir, f);
      return (
        rel.startsWith("data") ||
        (!rel.includes(path.sep) &&
          (rel.endsWith(".exe") || rel.endsWith(".dll")))
      );
    },
  } as any); // types are outdated, no include :(

  // and avoid the *unskippable* intro sequence lmao
  const flags = path.resolve(dir, "save00", "persistent", "flags");
  fs.mkdirSync(flags, { recursive: true });
  fs.writeFileSync(
    path.resolve(flags, "intro_has_played"),
    "why are you looking here\r\n",
  );

  // fs.writeFileSync(path.resolve(dir, "_branch.txt"), "master");

  // avoid the changelog popup by matching _version_hash.txt and "last_started_game_version_hash" in config
  fs.writeFileSync(path.resolve(dir, "_version_hash.txt"), "static");

  const saveShared = path.resolve(dir, "save_shared");
  fs.mkdirSync(saveShared, { recursive: true });
  fs.writeFileSync(
    path.resolve(saveShared, "config.xml"),
    "<Config\r\n" +
      '  config_format_version="14" \r\n' +
      '  mods_disclaimer_accepted="1"\r\n' +
      '  mods_sandbox_enabled="0"\r\n' +
      '  mods_sandbox_warning_done="1"\r\n' +
      '  last_started_game_version_hash="static"\r\n' +
      "/>\r\n",
  );

  const endTime = performance.now();
  console.log(
    `Hardlinked Noita files in ${((endTime - startTime) / 1000).toFixed(2)}s`,
  );
}

function setupLinuxEnv(
  dir: string,
  exe: string,
  initialArgs: string[],
): {
  command: string;
  args: string[];
  env: Record<string, string>;
} {
  const protonDir = findSteamApp("Proton - Experimental", "1493710");
  const compatData = path.resolve(dir, "steam-compat-data");
  fs.mkdirSync(compatData, { recursive: true });

  const dataHome = process.env.XDG_DATA_HOME;
  let clientInstallPath;
  if (dataHome) {
    clientInstallPath = path.resolve(dataHome, "Steam");
  } else {
    const home = process.env.HOME;
    if (!home) {
      console.error("HOME environment variable is not set.");
      process.exit(1);
    }
    clientInstallPath = path.resolve(home, ".local", "share", "Steam");
  }

  const env = {
    STEAM_COMPAT_CLIENT_INSTALL_PATH: clientInstallPath,
    STEAM_COMPAT_DATA_PATH: compatData,
    PROTON_LOG: "1",
    WINEDLLOVERRIDES: "winmm=n,b", // allow the winmm DLL injection thingie
  };

  const command = path.resolve(protonDir, "proton");
  const args = ["waitforexitandrun", exe, ...initialArgs];

  if (fs.existsSync("/etc/NIXOS")) {
    args.unshift(command);
    return { command: "steam-run", args, env };
  }

  return { command, args, env };
}

async function run(mod: NoitaMod | null, exe: string, noitaArgs: string[]) {
  const localNoita = path.resolve("noita");
  if (!fs.existsSync(localNoita)) {
    console.log("A local Noita instance not found, setting up...");
    setupNoitaInstance(localNoita);
  }

  if (mod) {
    const { id, vfs } = mod;
    console.log(`Installing mod ${id} to local Noita instance...`);
    const mods = path.resolve(localNoita, "mods");
    fs.mkdirSync(mods, { recursive: true });
    fs.rmSync(path.resolve(mods, id), { recursive: true, force: true });
    await vfs.finalize(mods);

    // lmao at some point I will have to actually parse nxml 🤷
    //  not now tho
    const save00 = path.resolve(localNoita, "save00");
    const modConfigPath = path.resolve(save00, "mod_config.xml");
    let modConfig;
    try {
      const prev = fs.readFileSync(modConfigPath, "utf-8");
      modConfig = prev.replace(
        new RegExp(`enabled="[01]" name="${id}"`),
        `enabled="1" name="${id}"`,
      );
    } catch {
      modConfig = `<Mods><Mod enabled="1" name="${id}" settings_fold_open="0" workshop_item_id="0" /></Mods>`;
    }
    fs.mkdirSync(save00, { recursive: true });
    fs.writeFileSync(modConfigPath, modConfig);
  }

  exe = path.resolve(localNoita, exe);
  let env = undefined;

  if (process.platform !== "win32") {
    console.log("Not running on Windows, adjusting for Linux");
    const {
      command,
      args,
      env: linuxEnv,
    } = setupLinuxEnv(localNoita, exe, noitaArgs);
    exe = command;
    noitaArgs = args;
    console.log(
      `Linux env:\n  ${Object.entries(linuxEnv)
        .map(([k, v]) => `${k}=${v}`)
        .join("\n  ")}`,
    );
    env = { ...process.env, ...linuxEnv };
  }

  console.log(`Noita launch commmand:\n  ${exe}\n  ${noitaArgs.join("\n  ")}`);

  const res = spawnSync(exe, noitaArgs, {
    cwd: localNoita,
    env,
    stdio: "inherit",
  });
  if (res.error) {
    console.error(res.error);
    process.exit(1);
  }
}

const program = new Command();

program
  .command("build")
  .alias("b")
  .option("-v, --verbose", "enable verbose output.")
  .option("-A, --dont-archive", "don't zip the result")
  .option("--dev", "build in dev mode (DEV build data set to true)")
  .description("Build a mod zip for distribution.")
  .action(
    async (opts: {
      verbose?: boolean;
      dontArchive?: boolean;
      dev?: boolean;
    }) => {
      const { id, vfs } = NoitaMod.make(opts);
      const outputDir = path.resolve("dist");
      fs.mkdirSync(outputDir, { recursive: true });
      if (opts.dontArchive) {
        await vfs.finalize(outputDir);
        console.log(`Built mod folder ${outputDir}/${id}`);
      } else {
        const zip = path.resolve(outputDir, `${id}.zip`);
        await vfs.archive(zip);
        console.log(`Built mod zip ${zip}`);
      }
    },
  );

program
  .command("run")
  .option("-v, --verbose", "enable verbose output.")
  .option("--non-dev", "build in non-dev mode (DEV build data set to false)")
  .description(
    "Run an isolated instance of Noita with the mod installed (requires Noita to be installed through Steam).",
  )
  .action(async (opts: { verbose?: boolean; nonDev?: boolean }) => {
    const mod = NoitaMod.make({ verbose: opts.verbose, dev: !opts.nonDev });
    await run(mod, "noita.exe", [
      "-no_logo_splashes",
      "-gamemode",
      "-always_store_userdata_in_workdir",
    ]);
  });

program
  .command("publish")
  .option("-v, --verbose", "enable verbose output.")
  .option(
    "--force-new",
    "ignore noita.workspace.id set in package.json and publish as a new workshop item.",
  )
  .argument("<change notes>", "the change notes for the Steam Workshop release")
  .description(
    "Run an isolated instance of Noita with the mod installed (requires Noita to be installed through Steam).",
  )
  .action(
    async (
      changeNotes,
      opts: {
        verbose?: boolean;
        forceNew?: boolean;
      },
    ) => {
      const mod = NoitaMod.make(opts);

      await run(mod, "noita_dev.exe", [
        "-workshop_upload",
        mod.id,
        "-workshop_upload_change_notes",
        changeNotes,
      ]);

      const workshopId = fs
        .readFileSync(`noita/mods/${mod.id}/workshop_id.txt`, "ascii")
        .trim();
      const workshopUrl = `https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`;

      // todo move package.json reading out of `run`
      const packageJsonPath = process.env.npm_package_json ?? "package.json";
      const packageJsonText = fs.readFileSync(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(packageJsonText);
      if (packageJson?.["noita.workshop.id"] != workshopId) {
        const edit = jsonc.modify(
          packageJsonText,
          ["noita.workshop.id"],
          workshopId,
          {
            formattingOptions: { insertSpaces: true, tabSize: 2 },
            getInsertionIndex(properties) {
              let idx = properties.indexOf("noita.id");
              if (idx != -1) {
                return idx + 1;
              }
              return properties.indexOf("name") + 1;
            },
          },
        );
        fs.writeFileSync(
          packageJsonPath,
          jsonc.applyEdits(packageJsonText, edit),
        );
        console.log(`Published the mod at ${workshopUrl}`);
      } else {
        console.log(`Updated the mod at ${workshopUrl}`);
      }
    },
  );

program
  .command("unpak")
  .description("Unpack the data.wak file")
  .action(() => run(null, "noita.exe", ["-wizard_unpak"]));

program.parse(process.argv);

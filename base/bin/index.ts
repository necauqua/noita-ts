#!/usr/bin/env node

import { spawnSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import syncDirectory from "sync-directory";
import * as jsonc from "jsonc-parser";
import NoitaMod from "./mod.js";
import { findNoita, findSteamApp } from "./steam.js";
import runTests from "./test.js";

function setupNoitaInstance(dir: string) {
  const noitaDir = findNoita();
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

/** Formats a byte count the way one would want to read it in a build report. */
function humanSize(bytes: number): string {
  if (Number.isNaN(bytes)) {
    return "?";
  }
  const units = ["B", "KiB", "MiB", "GiB"];
  let unit = 0;
  let size = bytes;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${unit === 0 ? size : size.toFixed(1)} ${units[unit]}`;
}

/** Prints what the build would have produced, for `nts build --no-emit`. */
function reportMod(mod: NoitaMod, target: string) {
  const entries = mod.vfs
    .entries()
    .sort((a, b) => (b.size || 0) - (a.size || 0) || a.path.localeCompare(b.path));
  const prefix = `${mod.id}/`;

  const sizes = entries.map((e) => humanSize(e.size));
  const width = Math.max(...sizes.map((s) => s.length));

  console.log(`Mod ${mod.id}, would be written to ${target}:`);
  for (const [i, { path: filePath }] of entries.entries()) {
    const name = filePath.startsWith(prefix)
      ? filePath.slice(prefix.length)
      : filePath;
    console.log(`  ${sizes[i].padStart(width)}  ${name}`);
  }

  const total = entries.reduce((sum, e) => sum + (e.size || 0), 0);
  console.log(
    `  ${entries.length} file${entries.length === 1 ? "" : "s"}, ${humanSize(total)} total (nothing written)`,
  );
}

program
  .command("build")
  .alias("b")
  .option("-v, --verbose", "enable verbose output.")
  .option("-A, --dont-archive", "don't zip the result")
  .option("--dev", "build in dev mode (DEV build data set to true)")
  .option(
    "--no-emit",
    "don't write anything, only report what the build would produce",
  )
  .description("Build a mod zip for distribution.")
  .action(
    async (opts: {
      verbose?: boolean;
      dontArchive?: boolean;
      dev?: boolean;
      emit: boolean;
    }) => {
      const mod = NoitaMod.make(opts);
      const { id, vfs } = mod;
      const outputDir = path.resolve("dist");
      if (!opts.emit) {
        reportMod(
          mod,
          opts.dontArchive
            ? path.join(outputDir, id)
            : path.join(outputDir, `${id}.zip`),
        );
        return;
      }
      fs.mkdirSync(outputDir, { recursive: true });
      if (opts.dontArchive) {
        await vfs.finalize(outputDir);
        console.log(`Built mod folder ${path.join(outputDir, id)}`);
      } else {
        const zip = path.join(outputDir, `${id}.zip`);
        await vfs.archive(zip);
        console.log(`Built mod zip ${zip}`);
      }
    },
  );

program
  .command("run")
  .option("-v, --verbose", "enable verbose output.")
  .option("--non-dev", "build in non-dev mode (DEV build data set to false)")
  .option("--dev-exe", "launch noita_dev.exe instead of noita.exe")
  .option("--gamemode <n>", "the gamemode index to start the game in.", "0")
  .option(
    "--extra-args <args...>",
    "extra arguments to append to the Noita command line.",
  )
  .description(
    "Run an isolated instance of Noita with the mod installed (requires Noita to be installed through Steam).",
  )
  .action(
    async (opts: {
      verbose?: boolean;
      nonDev?: boolean;
      devExe?: boolean;
      gamemode: string;
      extraArgs?: string[];
    }) => {
      const mod = NoitaMod.make({ verbose: opts.verbose, dev: !opts.nonDev });
      await run(mod, opts.devExe ? "noita_dev.exe" : "noita.exe", [
        "-always_store_userdata_in_workdir",
        "-no_logo_splashes",
        "-gamemode",
        opts.gamemode,
        ...(opts.extraArgs ?? []),
      ]);
    },
  );

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
  .command("test")
  .option("-v, --verbose", "enable verbose output.")
  .option(
    "-l, --game-log",
    "print the whole game log alongside the test report.",
  )
  .option(
    "--image <image>",
    "the headless Noita container image to run the tests in.",
    "noita-headless",
  )
  .option("--docker <binary>", "the container engine to use.", "docker")
  .option(
    "--noita <path>",
    "the Noita installation to run (default: the one installed through Steam).",
  )
  .option(
    "--timeout <seconds>",
    "how long to wait for the tests to report back.",
    "300",
  )
  .option("--seed <seed>", "the world seed to run the tests with.")
  .option("--keep", "leave the container running after the tests are done.")
  .description(
    "Run the mod's src/tests/ suite inside a headless Noita container.",
  )
  .action(
    async (opts: {
      verbose?: boolean;
      image: string;
      docker: string;
      noita?: string;
      timeout: string;
      seed?: string;
      keep?: boolean;
      gameLog?: boolean;
    }) => {
      const mod = NoitaMod.make({ verbose: opts.verbose, dev: true, test: true });

      // a directory of its own, as the container is given a mods folder
      const mods = path.resolve("dist", "test");
      fs.rmSync(mods, { recursive: true, force: true });
      await mod.vfs.finalize(mods);
      console.log(`Built the test mod into ${path.join(mods, mod.id)}`);

      await runTests(mods, {
        image: opts.image,
        docker: opts.docker,
        noita: opts.noita,
        timeout: Number(opts.timeout),
        seed: opts.seed,
        keep: opts.keep,
        gameLog: opts.gameLog,
      });
    },
  );

program
  .command("unpak")
  .description("Unpack the data.wak file")
  .action(() => run(null, "noita.exe", ["-wizard_unpak"]));

program.parse(process.argv);

#!/usr/bin/env node

import { spawnSync } from "child_process";
import { Command, Option } from "commander";
import fs from "fs";
import path from "path";
import readline from "readline/promises";
import { DEV_MODS, installDevMods } from "./devmods.js";
import { enableMods } from "./mod-config.js";
import syncDirectory from "sync-directory";
import * as jsonc from "jsonc-parser";
import NoitaMod from "./mod.js";
import { setupConfig } from "./game-config.js";
import { findNoita, findSteamApp } from "./steam.js";
import runTests from "./test.js";
import {
  publish as publishToWorkshop,
  validate as validateWorkshop,
  workshopIdInsertionIndex,
  VISIBILITIES,
  type Question,
  type Visibility,
} from "./workshop.js";

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

  setupConfig(noitaDir, path.resolve(dir, "save_shared"));

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

async function run(
  mod: NoitaMod | null,
  exe: string,
  noitaArgs: string[],
  { devMods = false }: { devMods?: boolean } = {},
) {
  const localNoita = path.resolve("noita");
  const firstRun = !fs.existsSync(localNoita);
  if (firstRun) {
    console.log("A local Noita instance not found, setting up...");
    setupNoitaInstance(localNoita);
    if (devMods) {
      console.log("Installing the dev mods...");
      installDevMods(localNoita);
    }
  }

  if (mod) {
    const { id, vfs } = mod;
    console.log(`Installing mod ${id} to local Noita instance...`);
    const mods = path.resolve(localNoita, "mods");
    fs.mkdirSync(mods, { recursive: true });
    fs.rmSync(path.resolve(mods, id), { recursive: true, force: true });
    await vfs.finalize(mods);
    enableMods(localNoita, [id]);
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
  .option(
    "--no-dev-mods",
    `do not install the dev tools (${DEV_MODS.map((m) => m.name).join(", ")}) when creating the instance.`,
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
      devMods: boolean;
    }) => {
      const mod = NoitaMod.make({ verbose: opts.verbose, dev: !opts.nonDev });
      await run(
        mod,
        opts.devExe ? "noita_dev.exe" : "noita.exe",
        [
          "-always_store_userdata_in_workdir",
          "-no_logo_splashes",
          "-gamemode",
          opts.gamemode,
          ...(opts.extraArgs ?? []),
        ],
        { devMods: opts.devMods },
      );
    },
  );

/**
 * Puts the questions to the author, and gives up unless every answer is yes.
 *
 * A Workshop item is live the moment it uploads and its mistakes are awkward
 * to take back, so anything other than an explicit yes counts as no.
 */
async function confirmAllOrExit(
  questions: Question[],
  assumeYes: boolean | undefined,
) {
  if (questions.length === 0 || assumeYes) {
    for (const { note } of questions) {
      console.warn(`Warning: ${note}`);
    }
    return;
  }

  if (!process.stdin.isTTY) {
    for (const { note, prompt } of questions) {
      console.warn(`Warning: ${note}`);
      console.error(
        `  ${prompt} - nothing here to answer with, pass --yes to accept it.`,
      );
    }
    process.exit(1);
  }

  // one interface for all of them: a fresh one per question swallows whatever
  // the previous already read ahead of the answer it was given
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    for (const { note, prompt } of questions) {
      console.warn(`Warning: ${note}`);
      let answer;
      try {
        answer = await rl.question(`  ${prompt} [y/N] `);
      } catch {
        // end of input, which is not a yes
        answer = "";
      }
      if (!/^y(es)?$/i.test(answer.trim())) {
        console.error("Nothing was published.");
        process.exit(1);
      }
    }
  } finally {
    rl.close();
  }
}

/** Stores the id of a freshly created Workshop item back into package.json. */
function saveWorkshopId(workshopId: string) {
  // todo move package.json reading out of `run`
  const packageJsonPath = process.env.npm_package_json ?? "package.json";
  const packageJsonText = fs.readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonText);
  if (String(packageJson?.["noita.workshop.id"]) === workshopId) {
    return;
  }
  const edit = jsonc.modify(
    packageJsonText,
    ["noita.workshop.id"],
    workshopId,
    {
      formattingOptions: { insertSpaces: true, tabSize: 2 },
      getInsertionIndex: (properties) =>
        workshopIdInsertionIndex(properties, packageJson),
    },
  );
  fs.writeFileSync(packageJsonPath, jsonc.applyEdits(packageJsonText, edit));
}

program
  .command("publish")
  .option("-v, --verbose", "enable verbose output.")
  .option(
    "--force-new",
    "ignore noita.workshop.id set in package.json and publish as a new workshop item.",
  )
  .addOption(
    new Option(
      "--visibility <visibility>",
      "the visibility to set on the item; new items are unlisted unless this says otherwise, and existing ones are left as they are.",
    ).choices(VISIBILITIES),
  )
  .option(
    "--via-game",
    "upload through noita_dev.exe instead of talking to Steam directly (requires Noita to be installed through Steam).",
  )
  .option("-y, --yes", "answer every confirmation with yes.")
  .argument("<change notes>", "the change notes for the Steam Workshop release")
  .description("Publish or update the mod on the Steam Workshop.")
  .action(
    async (
      changeNotes,
      opts: {
        verbose?: boolean;
        forceNew?: boolean;
        visibility?: Visibility;
        viaGame?: boolean;
        yes?: boolean;
      },
    ) => {
      const mod = NoitaMod.make({
        verbose: opts.verbose,
        noWorkshopId: opts.forceNew,
      });

      const { warnings, questions } = validateWorkshop(mod, {
        viaGame: opts.viaGame,
        visibility: opts.visibility,
      });
      for (const warning of warnings) {
        console.warn(`Warning: ${warning}`);
      }
      await confirmAllOrExit(questions, opts.yes);

      let workshopId;
      let created;
      let needsToAcceptAgreement = false;

      if (opts.viaGame) {
        await run(mod, "noita_dev.exe", [
          "-workshop_upload",
          mod.id,
          "-workshop_upload_change_notes",
          changeNotes,
        ]);
        workshopId = fs
          .readFileSync(`noita/mods/${mod.id}/workshop_id.txt`, "ascii")
          .trim();
        created = mod.workshop.id !== workshopId;
      } else {
        const result = await publishToWorkshop(mod, {
          changeNotes,
          forceNew: opts.forceNew,
          visibility: opts.visibility,
          onItemCreated: saveWorkshopId,
        });
        workshopId = result.itemId;
        created = result.created;
        needsToAcceptAgreement = result.needsToAcceptAgreement;
      }

      saveWorkshopId(workshopId);

      const workshopUrl = `https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`;
      console.log(
        created
          ? `Published the mod at ${workshopUrl}`
          : `Updated the mod at ${workshopUrl}`,
      );

      if (created && !opts.viaGame && opts.visibility === undefined) {
        console.log(
          "It is unlisted, so only this link leads to it - publish again with " +
            "--visibility public once it looks right.",
        );
      }

      if (needsToAcceptAgreement) {
        console.warn(
          "The item stays hidden until you accept the Steam Workshop legal " +
            "agreement at\n  " +
            "https://steamcommunity.com/sharedfiles/workshoplegalagreement",
        );
      }

      // the Steam bindings keep a callback pump running on the event loop
      process.exit(0);
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

program.parseAsync(process.argv).catch((error) => {
  // most of what goes wrong here is something the user has to fix - a mod Steam
  // will not take, a Steam that is not running - and it says so itself, so a
  // stack trace would only bury the explanation
  const verbose =
    process.argv.includes("-v") || process.argv.includes("--verbose");
  if (verbose || !(error instanceof Error)) {
    console.error(error);
  } else {
    console.error(error.message);
    if (error.cause) {
      console.error(`  caused by: ${error.cause}`);
    }
  }
  process.exit(1);
});

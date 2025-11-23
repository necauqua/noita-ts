#!/usr/bin/env node

import archiver from "archiver";
import { spawnSync } from "child_process";
import { Command } from "commander";
import fs, { ReadStream } from "fs";
import path from "path";
import {
  findSteamAppSync,
  SteamAppNotFoundError,
  SteamNotFoundError,
} from "steam-locate";
import syncDirectory from "sync-directory";
import ts from "typescript";
import tstl from "typescript-to-lua";

class VFS {
  files: Record<string, string | ReadStream> = {};
  private cwd: string = "";

  cd(cwd: string) {
    this.cwd = cwd;
  }

  write(filePath: string, content: string | ReadStream) {
    this.files[this.cwd != "" ? this.cwd + "/" + filePath : filePath] = content;
  }

  finalize(outputPath: string, zip: boolean) {
    if (zip) {
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });
      archive.pipe(fs.createWriteStream(outputPath));
      for (const [filePath, content] of Object.entries(this.files)) {
        archive.append(content, { name: filePath });
      }
      archive.finalize();
    } else {
      for (const [filePath, content] of Object.entries(this.files)) {
        const fullPath = path.join(outputPath, filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        if (typeof content === "string") {
          fs.writeFileSync(fullPath, content);
        } else {
          content.pipe(fs.createWriteStream(fullPath));
        }
      }
    }
  }
}

type BuildData = {
  modId: string;
  dev: boolean;
};

function transpile(
  name: string,
  vfs: VFS,
  verbose: boolean,
  buildData: BuildData,
): readonly ts.Diagnostic[] {
  const entry = path.join(process.cwd(), "src", `${name}.ts`);
  if (!fs.existsSync(entry)) {
    return [];
  }
  const tmpDir = path.join(process.cwd(), "node_modules", "noita-ts-synthetic");
  fs.mkdirSync(tmpDir, { recursive: true });
  const syntheticModule = path.join(tmpDir, "mod.lua");
  fs.writeFileSync(
    syntheticModule,
    `return { MOD_ID = "${buildData.modId}", DEV = ${buildData.dev} }`,
  );

  const res = tstl.parseConfigFileWithSystem(
    path.join(process.cwd(), "tsconfig.json"),
    {
      luaBundle: `${name}.lua`,
      luaBundleEntry: `src/${name}.ts`,
      tstlVerbose: verbose,
      luaPlugins: [
        {
          plugin: {
            moduleResolution: (module) =>
              module == "$mod" ? syntheticModule : undefined,
          },
        },
      ],
    },
  );

  if (res.errors.length > 0) {
    return res.errors;
  }

  const { diagnostics } = tstl.transpileFiles(
    [path.join(process.cwd(), "src", `${name}.ts`)],
    res.options,
    (fileName, text) => {
      // dont disable them in tsconfig because "composite" wants it there
      if (!fileName.endsWith(".d.ts") && !fileName.endsWith(".tsbuildinfo")) {
        vfs.write(path.relative(process.cwd(), fileName), text);
      }
    },
  );

  fs.rmSync(tmpDir, { recursive: true, force: true });

  return diagnostics;
}

function makeNoitaMod(
  verbose: boolean,
  dev: boolean,
): { id: string; vfs: VFS } {
  const vfs = new VFS();

  const packageJson = JSON.parse(
    fs.readFileSync(process.env.npm_package_json ?? "package.json", "utf-8"),
  );
  const id = packageJson?.["noita.id"] ?? packageJson.name;

  vfs.cd(id);
  vfs.write("mod_id.txt", id);

  const buildData = {
    modId: id,
    dev,
  };

  const diagnostics = [
    ...transpile("init", vfs, verbose, buildData),
    ...transpile("settings", vfs, verbose, buildData),
  ];
  if (diagnostics.length > 0) {
    const reporter = tstl.createDiagnosticReporter(true);
    for (const diagnostic of diagnostics) {
      reporter(diagnostic);
    }
    process.exit(1);
  }

  const versionBuiltWith = packageJson?.["noita.compat"];
  if (versionBuiltWith) {
    vfs.write(
      "compatibility.xml",
      `<Mod _format_version="0" version_built_with="${versionBuiltWith}"/>`,
    );
  }

  const modXml = {
    name: packageJson?.["noita.name"] ?? id,
    description: packageJson?.["noita.description"] ?? packageJson.description,
    ui_newgame_name: packageJson?.["noita.ui-newgame-name"],
    ui_newgame_description: packageJson?.["noita.ui-newgame-description"],
    ui_newgame_gfx_banner_bg: packageJson?.["noita.ui-newgame-gfx-banner-bg"],
    ui_newgame_gfx_banner_fg: packageJson?.["noita.ui-newgame-gfx-banner-fg"],
    request_no_api_restrictions: packageJson?.["noita.unsafe"]
      ? "1"
      : undefined,
    is_game_mode: packageJson?.["noita.is-game-mode"] ? "1" : undefined,
    game_mode_supports_save_slots: packageJson?.[
      "noita.game-mode-supports-save-slots"
    ]
      ? "1"
      : undefined,
    is_translation: packageJson?.["noita.is-translation"] ? "1" : undefined,
    translation_xml_path: packageJson?.["noita.translation-xml-path"],
    translation_csv_path: packageJson?.["noita.translation-csv-path"],

    // not officially supported, but potentially useful in distant future
    download_url: packageJson?.["noita.download-url"],
  };

  vfs.write(
    "mod.xml",
    [
      `<Mod`,
      ...Object.entries(modXml)
        .filter(([, v]) => !!v)
        .map(([k, v]) => `  ${k}="${v}"`),
      `/>`,
    ].join("\r\n"),
  );

  const src = path.join(process.cwd(), "src");
  const files = fs.readdirSync(src, {
    recursive: true,
  });
  for (const file of files) {
    if (typeof file !== "string") {
      continue;
    }
    if (!file.endsWith(".ts")) {
      const fullPath = path.join(src, file);
      if (fs.statSync(fullPath).isFile()) {
        vfs.write(file, fs.createReadStream(fullPath));
      }
    }
  }

  return { id, vfs };
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
    (opts: { verbose?: boolean; dontArchive?: boolean; dev?: boolean }) => {
      const { id, vfs } = makeNoitaMod(!!opts.verbose, !!opts.dev);
      const outputDir = path.resolve("dist");
      fs.mkdirSync(outputDir, { recursive: true });
      if (opts.dontArchive) {
        vfs.finalize(outputDir, false);
        console.log(`Built mod folder ${outputDir}/${id}`);
      } else {
        vfs.finalize(path.resolve(outputDir, `${id}.zip`), true);
        console.log(`Built mod zip ${outputDir}`);
      }
    },
  );

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

program
  .command("run")
  .description(
    "Run an isolated instance of Noita with the mod installed (requires Noita to be installed through Steam).",
  )
  .action(() => {
    const localNoita = path.resolve("noita");
    if (!fs.existsSync(localNoita)) {
      console.log("A local Noita instance not found, setting up...");
      setupNoitaInstance(localNoita);
    }

    const { id, vfs } = makeNoitaMod(false, true);
    console.log(`Installing mod ${id} to local Noita instance...`);
    const mods = path.resolve(localNoita, "mods");
    fs.mkdirSync(mods, { recursive: true });
    vfs.finalize(mods, false);

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

    let exe = path.resolve(localNoita, "noita.exe");
    let noitaArgs = [
      "-no_logo_splashes",
      "-gamemode",
      "-always_store_userdata_in_workdir",
    ];
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

    console.log(
      `Noita launch commmand:\n  ${exe}\n  ${noitaArgs.join("\n  ")}`,
    );

    const res = spawnSync(exe, noitaArgs, {
      cwd: localNoita,
      env,
      stdio: "inherit",
    });
    if (res.error) {
      console.error(res.error);
      process.exit(1);
    }
  });

program.parse(process.argv);

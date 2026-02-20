import fs from "fs";
import path from "path";
import ts from "typescript";
import tstl from "typescript-to-lua";
import IncludePlugin from "./plugins/include.js";
import JsonPlugin from "./plugins/json-polyfill.js";
import NoitaRequirePlugin from "./plugins/noita-require.js";
import NoitaSettingsPlugin from "./plugins/noita-settings.js";
import VFS from "./vfs.js";

export type BuildData = {
  modId: string;
  dev: boolean;
};

function transpile(
  vfs: VFS,
  verbose: boolean,
  buildData: BuildData,
): readonly ts.Diagnostic[] {
  const luaPlugins: tstl.InMemoryLuaPlugin[] = [
    { plugin: new JsonPlugin("@noita-ts/base/dist/json", verbose) },
    {
      plugin: new IncludePlugin(
        "noita-ts-include",
        vfs.write.bind(vfs),
        verbose,
      ),
    },
    { plugin: new NoitaRequirePlugin(buildData, vfs.write.bind(vfs)) },
  ];
  const writeFile = (fileName: string, text: string) =>
    vfs.write(path.relative(cwd, fileName), text);

  const cwd = process.cwd();

  const config = tstl.parseConfigFileWithSystem(
    path.join(cwd, "tsconfig.json"),
    {
      tstlVerbose: verbose,
      // sourceMapTraceback: dev, // requires "debug", so only works for unsafe mods
      luaPlugins,
      rootDir: "src",
    },
  );

  if (config.errors.length > 0) {
    return config.errors;
  }

  const diagnostics: ts.Diagnostic[] = [];

  const program = ts.createProgram(config.fileNames, config.options);
  diagnostics.push(...ts.getPreEmitDiagnostics(program));

  const res = new tstl.Transpiler().emit({ program, writeFile });
  diagnostics.push(...res.diagnostics);

  // Settings cannot dofile_once any non-vanilla files - including our own
  //  - but we allow to import own files by the magic of having an additional
  //  tstl pass with bundling enabled
  //  This is kinda required for lualib_bundle, because the moment you use any
  //  TS polyfill, the settings would break 🤷
  const settings = path.join("src", "settings.ts");
  const settingsFull = path.join(cwd, settings);
  if (program.getRootFileNames().findIndex((f) => f == settingsFull) !== -1) {
    if (verbose) {
      console.log("Second transpilation pass (to bundle settings.ts):");
    }

    luaPlugins.unshift({ plugin: new NoitaSettingsPlugin(buildData) });
    config.options.luaBundle = "settings.lua";
    config.options.luaBundleEntry = settings;

    const settingsProgram = ts.createProgram([settingsFull], config.options);
    diagnostics.push(...ts.getPreEmitDiagnostics(settingsProgram));

    const res = new tstl.Transpiler().emit({
      program: settingsProgram,
      writeFile,
    });
    diagnostics.push(...res.diagnostics);
  }

  return ts.sortAndDeduplicateDiagnostics(diagnostics);
}

export default class NoitaMod {
  id: string;
  vfs: VFS;

  constructor(id: string, vfs: VFS) {
    this.id = id;
    this.vfs = vfs;
  }

  static make({
    verbose,
    dev,
    noWorkshopId,
  }: {
    verbose?: boolean;
    dev?: boolean;
    noWorkshopId?: boolean;
  }): NoitaMod {
    const vfs = new VFS();

    const packageJson = JSON.parse(
      fs.readFileSync(process.env.npm_package_json ?? "package.json", "utf-8"),
    );
    const id = packageJson?.["noita.id"] ?? packageJson.name;

    if (!id) {
      throw new Error('No mod ID ("noita.id" or "name") found in package.json');
    }

    vfs.cd(id);
    vfs.write("mod_id.txt", id);

    const buildData = {
      modId: id,
      dev: !!dev,
    };

    const diagnostics = transpile(vfs, !!verbose, buildData);
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
      description:
        packageJson?.["noita.description"] ?? packageJson.description,
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

    const workshopXml = {
      name: packageJson?.["noita.workshop.name"] ?? modXml.name,
      description:
        packageJson?.["noita.workshop.description"] ?? modXml.description,
      tags: (packageJson?.["noita.workshop.tags"] ?? []).join(","),
      dont_upload_files: (
        packageJson?.["noita.workshop.skip-files"] ?? []
      ).join("|"),
      dont_upload_folders: (
        packageJson?.["noita.workshop.skip-folders"] ?? []
      ).join("|"),
    };

    const xmlConfig = (entries: Record<string, string | undefined>) =>
      [
        `<Mod`,
        ...Object.entries(entries)
          .filter(([, v]) => !!v)
          .map(([k, v]) => `  ${k}="${v}"`),
        `/>`,
      ].join("\r\n");

    vfs.write("mod.xml", xmlConfig(modXml));
    vfs.write("workshop.xml", xmlConfig(workshopXml));
    const workshopId = packageJson?.["noita.workshop.id"];
    if (workshopId && !noWorkshopId) {
      vfs.write("workshop_id.txt", workshopId.toString());
    }

    try {
      const name = "workshop-preview.png";
      fs.statSync(name); // meh check-then-act who cares
      vfs.write("workshop_preview_image.png", fs.createReadStream(name));
    } catch (e) {
      // ignore
    }

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

    return new NoitaMod(id, vfs);
  }
}

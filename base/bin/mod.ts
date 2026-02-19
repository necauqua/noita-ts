import fs from "fs";
import path from "path";
import ts from "typescript";
import tstl from "typescript-to-lua";
import JsonPlugin from "./json-plugin.js";
import VFS from "./vfs.js";

export type BuildData = {
  modId: string;
  dev: boolean;
};

function transpile(
  vfs: VFS,
  verbose: boolean,
  { modId, dev }: BuildData,
): readonly ts.Diagnostic[] {
  const cwd = process.cwd();

  const shim = fs
    .readFileSync(new URL("require_shim.lua", import.meta.url), "utf-8")
    .replaceAll("{{MOD_ID}}", modId)
    .replaceAll('"{{DEV}}"', dev.toString());

  vfs.write("require_shim.lua", shim);

  const settings_prepend = fs
    .readFileSync(new URL("settings_shim.lua", import.meta.url), "utf-8")
    .replaceAll("{{MOD_ID}}", modId)
    .replaceAll('"{{DEV}}"', dev.toString());

  const settings_insert = `
local ____lib = require 'data/scripts/lib/mod_settings.lua'
local ModSettingScope = {
  NewGame = ____lib.MOD_SETTING_SCOPE_NEW_GAME,
  Restart = ____lib.MOD_SETTING_SCOPE_RUNTIME_RESTART,
  Runtime = ____lib.MOD_SETTING_SCOPE_RUNTIME,
}
function ModSettingsUpdate(init_scope) ____lib.mod_settings_update("${modId}", $1, init_scope) end
function ModSettingsGuiCount() return ____lib.mod_settings_gui_count("${modId}", $1) end
function ModSettingsGui(gui, in_main_menu) ____lib.mod_settings_gui("${modId}", $1, gui, in_main_menu) end
$1 = `;

  const config = tstl.parseConfigFileWithSystem(
    path.join(cwd, "tsconfig.json"),
    {
      tstlVerbose: verbose,
      // sourceMapTraceback: dev, // requires "debug", so only works for unsafe mods
      luaPlugins: [
        { plugin: new JsonPlugin(verbose) },
        {
          plugin: {
            beforeEmit(_program, _options, emitHost, result) {
              for (const file of result) {
                const relative = path.relative(
                  emitHost.getCurrentDirectory(),
                  file.outputPath,
                );
                const srcRelative = relative.replace(/^src[\/\\]+/, "");
                file.outputPath = path.resolve(cwd, srcRelative);

                if (srcRelative == "settings.lua") {
                  file.code =
                    settings_prepend +
                    "\n" +
                    file.code.replace(
                      /(_+exports\.default) = /,
                      settings_insert,
                    );
                  continue;
                }
                file.code = `dofile_once('mods/${modId}/require_shim.lua')\n\n${file.code}`;

                const { fileName } = file as any; // from tstl.ProcessedFile
                if (typeof fileName !== "string") {
                  continue;
                }
                const dir = path.dirname(fileName);
                for (const [_, include] of file.code.matchAll(
                  /^\s*---\s*@noita-ts-include\s+(\S+)\s*$/gm,
                )) {
                  if (verbose) {
                    console.log(
                      `@noita-ts-include "${include}" encountered in ${relative}`,
                    );
                  }
                  const originalFile = path.resolve(dir, include);
                  try {
                    fs.statSync(originalFile);
                    vfs.write(
                      path.join(path.dirname(relative), include),
                      fs.createReadStream(originalFile),
                    );
                  } catch (e) {
                    console.error(
                      `failed to include ${include} from file ${relative}`,
                    );
                  }
                }
              }
            },
          },
        },
      ],
    },
  );

  if (config.errors.length > 0) {
    return config.errors;
  }

  const program = ts.createProgram(config.fileNames, config.options);
  const preEmitDiagnostics = ts.getPreEmitDiagnostics(program);
  const { diagnostics } = new tstl.Transpiler().emit({
    program,
    writeFile: (fileName, text) =>
      vfs.write(path.relative(process.cwd(), fileName), text),
  });

  return ts.sortAndDeduplicateDiagnostics([
    ...preEmitDiagnostics,
    ...diagnostics,
  ]);
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

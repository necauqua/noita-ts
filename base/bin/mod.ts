import fs from "fs";
import path from "path";
import ts from "typescript";
import tstl from "typescript-to-lua";
// Not re-exported from tstl's entrypoint, but it's the only way to resolve the
// `luaPlugins` option (a mix of inline instances and module names) into actual
// plugin objects. Resolution is `require`-cached, so these are the very same
// instances tstl itself uses during the emit.
import { getPlugins } from "typescript-to-lua/dist/transpilation/plugins.js";
import IncludePlugin from "./plugins/include.js";
import JsonPlugin from "./plugins/json-polyfill.js";
import NoitaRequirePlugin from "./plugins/noita-require.js";
import NoitaSettingsPlugin from "./plugins/noita-settings.js";
import VFS from "./vfs.js";

export type BuildData = {
  modId: string;
  dev: boolean;
  /** Whether this is an `nts test` build, see `testModules`. */
  test?: boolean;
};

/**
 * The test suite: an optional `src/test.ts` and everything under `src/tests/`.
 * Both are left out of regular builds, and `nts test` makes `init.lua` require
 * all of them.
 */
const TEST_ENTRY = "test.ts";
const TEST_DIR = "tests";

/**
 * Finds the installed `@noita-ts/base` dist, walking up from the mod - npm
 * hoists a dependency of a workspace into the root `node_modules`, so it is
 * not always right next to the mod.
 */
function baseDist(cwd: string): string {
  for (let dir = path.resolve(cwd); ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, "node_modules/@noita-ts/base/dist");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    if (path.dirname(dir) === dir) {
      throw new Error("@noita-ts/base is not installed");
    }
  }
}

/**
 * Lists the suite as Lua module names, in the order they should be required:
 * `src/test.ts` first, as the place to put whatever the cases need, then every
 * file under `src/tests/`.
 */
function testModules(cwd: string): string[] {
  const src = path.join(cwd, "src");
  const modules: string[] = [];

  if (fs.existsSync(path.join(src, TEST_ENTRY))) {
    modules.push(path.basename(TEST_ENTRY, ".ts"));
  }

  const dir = path.join(src, TEST_DIR);
  if (!fs.existsSync(dir)) {
    return modules;
  }
  const cases = fs
    .readdirSync(dir, { recursive: true })
    .flatMap((file) =>
      typeof file === "string" &&
      file.endsWith(".ts") &&
      fs.statSync(path.join(dir, file)).isFile()
        ? [[TEST_DIR, ...file.slice(0, -3).split(path.sep)].join(".")]
        : [],
    );
  cases.sort();

  return [...modules, ...cases];
}

/**
 * Optional hook a tstl plugin may implement to exclude files from the built mod.
 *
 * Every file under `src/` that isn't a `.ts` source is normally copied into the
 * mod. A plugin that processes some of those files into Lua at build time can
 * implement this to prevent the originals from shipping.
 */
export interface AssetPlugin {
  /**
   * Returns `true` to exclude the file from the mod.
   *
   * @param relativePath path relative to `src/`
   * @param fullPath absolute path on disk
   */
  excludeAsset?(relativePath: string, fullPath: string): boolean;
}

function transpile(
  vfs: VFS,
  verbose: boolean,
  buildData: BuildData,
): { diagnostics: readonly ts.Diagnostic[]; plugins: tstl.Plugin[] } {
  const luaPlugins: Array<tstl.LuaPluginImport | tstl.InMemoryLuaPlugin> = [
    { plugin: new JsonPlugin("@noita-ts/base/json", verbose) },
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
      rootDir: "src",
    },
  );

  if (config.errors.length > 0) {
    return { diagnostics: config.errors, plugins: [] };
  }

  config.options.luaTarget ??= tstl.LuaTarget.LuaJIT;
  config.options.luaLibImport ??= tstl.LuaLibImportKind.RequireMinimal;
  config.options.noImplicitSelf ??= true;

  // $mod, explicit .lua imports and ffi are special-cased by the require shim
  config.options.noResolvePaths = [
    ...new Set([...(config.options.noResolvePaths ?? []), "$mod", "**.lua", "ffi"]),
  ];

  luaPlugins.push(...(config.options.luaPlugins ?? []));
  config.options.luaPlugins = luaPlugins;

  const diagnostics: ts.Diagnostic[] = [];

  const src = path.join(cwd, "src");
  const testEntry = path.join(src, TEST_ENTRY);
  const testDir = path.join(src, TEST_DIR) + path.sep;
  const isTestFile = (fileName: string) => {
    const full = path.normalize(fileName);
    return full === testEntry || full.startsWith(testDir);
  };

  const fileNames = buildData.test
    ? config.fileNames
    : config.fileNames.filter((f) => !isTestFile(f));

  const program = ts.createProgram(fileNames, config.options);
  diagnostics.push(...ts.getPreEmitDiagnostics(program));

  const res = new tstl.Transpiler().emit({ program, writeFile });
  diagnostics.push(...res.diagnostics);

  // Resolved from the first program: it already carries every plugin, and the
  // settings pass below only prepends one of ours (which has no asset hook).
  const resolved = getPlugins(program);
  diagnostics.push(...resolved.diagnostics);
  const plugins = resolved.plugins;

  // Settings cannot dofile_once any non-vanilla files - including our own
  //  - but we allow to import own files by the magic of having an additional
  //  tstl pass with bundling enabled
  //  This is kinda required for lualib_bundle, because the moment you use any
  //  TS polyfill, the settings would break 🤷
  const settings = path.join("src", "settings.ts");
  const settingsFull = path.join(cwd, settings);
  if (
    program
      .getRootFileNames()
      .findIndex((f) => path.normalize(f) == settingsFull) !== -1
  ) {
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

  return {
    diagnostics: ts.sortAndDeduplicateDiagnostics(diagnostics),
    plugins,
  };
}

/**
 * Everything `nts publish` needs to describe the mod on the Steam Workshop,
 * collected from the `noita.workshop.*` keys of package.json.
 */
export type WorkshopMeta = {
  /** `noita.workshop.id`, the item to update, absent for a brand new item. */
  id?: string;
  name: string;
  description?: string;
  tags: string[];
  /** Paths relative to the mod root that are left out of the upload. */
  skipFiles: string[];
  /** Folders relative to the mod root that are left out of the upload. */
  skipFolders: string[];
  /** Absolute path of the preview image, when the mod has one. */
  previewPath?: string;
  /** `noita.unsafe` - such mods are not allowed on the Workshop. */
  unsafe: boolean;
};

/** The preview image, picked up from the package root. */
export const PREVIEW_IMAGE = "workshop-preview.png";

export default class NoitaMod {
  id: string;
  vfs: VFS;
  workshop: WorkshopMeta;

  constructor(id: string, vfs: VFS, workshop: WorkshopMeta) {
    this.id = id;
    this.vfs = vfs;
    this.workshop = workshop;
  }

  static make({
    verbose,
    dev,
    noWorkshopId,
    test,
  }: {
    verbose?: boolean;
    dev?: boolean;
    noWorkshopId?: boolean;
    test?: boolean;
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
      test: !!test,
    };

    const { diagnostics, plugins } = transpile(vfs, !!verbose, buildData);

    if (buildData.test) {
      // The test entry point is added to init.lua below rather than imported by
      // the user's TypeScript program. Copy the base test modules explicitly
      // so the generated require can load them from the mod's lua_modules.
      const dist = baseDist(process.cwd());
      const baseTest = fs.readFileSync(path.join(dist, "test.lua"), "utf-8");
      vfs.write(
        "lua_modules/@noita-ts/base/dist/test.lua",
        // The published library's test module is not part of the user's
        // TypeScript program, so tstl does not emit it as a dependency.
        baseTest.replace(
          'require("index")',
          'require("lua_modules.@noita-ts.base.dist.index")',
        ),
      );
      if (!vfs.has("lua_modules/@noita-ts/base/dist/index.lua")) {
        vfs.write(
          "lua_modules/@noita-ts/base/dist/index.lua",
          fs.readFileSync(path.join(dist, "index.lua")),
        );
      }

      const modules = testModules(process.cwd());
      if (modules.length === 0) {
        console.warn(
          `No tests found - they go into src/${TEST_DIR}/ (or src/${TEST_ENTRY})`,
        );
      }
      // the suite is loaded from the mod entry point, so that everything the
      // mod itself sets up on load is in place by the time tests register
      const entry =
        [
          'require("lua_modules.@noita-ts.base.dist.test")',
          ...modules.map((m) => `require("${m}")`),
        ].join("\n") + "\n";
      if (vfs.has("init.lua")) {
        // the module ends in `return ____exports`, and nothing may follow a
        // return in a Lua chunk, so the require goes right in front of it
        const code = vfs.read("init.lua");
        const ret = code.lastIndexOf("\nreturn ");
        vfs.write(
          "init.lua",
          ret === -1
            ? `${code}\n${entry}`
            : `${code.slice(0, ret + 1)}${entry}${code.slice(ret + 1)}`,
        );
      } else {
        vfs.write(
          "init.lua",
          `dofile_once('mods/${id}/require_shim.lua')\n\n${entry}`,
        );
      }
    }
    if (diagnostics.length > 0) {
      const reporter = tstl.createDiagnosticReporter(true);
      for (const diagnostic of diagnostics) {
        reporter(diagnostic);
      }
      process.exit(1);
    }

    const assetFilters = plugins
      .map((p) => (p as AssetPlugin).excludeAsset?.bind(p))
      .filter((f) => f !== undefined);

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

    const tags: string[] = packageJson?.["noita.workshop.tags"] ?? [];
    const skipFiles: string[] = packageJson?.["noita.workshop.skip-files"] ?? [];
    const skipFolders: string[] =
      packageJson?.["noita.workshop.skip-folders"] ?? [];

    const workshopXml = {
      name: packageJson?.["noita.workshop.name"] ?? modXml.name,
      description:
        packageJson?.["noita.workshop.description"] ?? modXml.description,
      tags: tags.join(","),
      dont_upload_files: skipFiles.join("|"),
      dont_upload_folders: skipFolders.join("|"),
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

    let previewPath: string | undefined;
    try {
      fs.statSync(PREVIEW_IMAGE); // meh check-then-act who cares
      previewPath = path.resolve(PREVIEW_IMAGE);
      vfs.writeFrom("workshop_preview_image.png", PREVIEW_IMAGE);
    } catch (e) {
      // ignore
    }

    const workshop: WorkshopMeta = {
      id: workshopId === undefined ? undefined : String(workshopId),
      name: workshopXml.name,
      description: workshopXml.description,
      tags,
      skipFiles,
      skipFolders,
      previewPath,
      unsafe: !!packageJson?.["noita.unsafe"],
    };

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
          if (assetFilters.some((filter) => filter(file, fullPath))) {
            continue;
          }
          vfs.writeFrom(file, fullPath);
        }
      }
    }

    return new NoitaMod(id, vfs, workshop);
  }
}

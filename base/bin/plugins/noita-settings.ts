import path from "path";
import { Program } from "typescript";
import {
  CompilerOptions,
  EmitHost,
  Plugin,
  ProcessedFile,
} from "typescript-to-lua";
import type { BuildData } from "../mod.js";

const mkShim = (modId: string) => `
local ____lib = require('data/scripts/lib/mod_settings.lua')
local ModSettingScope = {
  NewGame = ____lib.MOD_SETTING_SCOPE_NEW_GAME,
  Restart = ____lib.MOD_SETTING_SCOPE_RUNTIME_RESTART,
  Runtime = ____lib.MOD_SETTING_SCOPE_RUNTIME,
}
local function ____register_handlers(exports)
    local settings = exports.default
    ModSettingsUpdate = function(init_scope) ____lib.mod_settings_update("${modId}", settings, init_scope) end
    ModSettingsGuiCount = function() return ____lib.mod_settings_gui_count("${modId}", settings) end
    ModSettingsGui = function(gui, in_main_menu) ____lib.mod_settings_gui("${modId}", settings, gui, in_main_menu) end
end
`;

export default class NoitaSettingsPlugin implements Plugin {
  private shim: string;

  constructor(buildData: BuildData) {
    this.shim = mkShim(buildData.modId);
  }

  afterPrint(
    _program: Program,
    _options: CompilerOptions,
    emitHost: EmitHost,
    result: ProcessedFile[],
  ) {
    const settings = path.join("src", "settings.ts");

    for (const file of result) {
      const relative = path.relative(
        emitHost.getCurrentDirectory(),
        file.fileName,
      );

      if (relative !== settings) {
        continue;
      }

      file.code =
        this.shim +
        file.code.replace(/^return (_+exports)/m, "____register_handlers($1)");

      // force sourceMapNode to recompute because bundling actually reads from
      // it and ignores file.code
      file.sourceMapNode = undefined;

      break;
    }
  }
}

import { Program } from "typescript";
import {
  CompilerOptions,
  EmitFile,
  EmitHost,
  Plugin,
  ProcessedFile,
} from "typescript-to-lua";
import type { BuildData } from "../mod.js";

type WriteCallback = (filePath: string, content: string) => void;

// `____originalRequire` is used by tstl bundler (and yes we end up having 2 require wrappers there)
const mkShim = (buildData: BuildData) => `
local ____originalNoitaRequire = require

function require(module)
  if module == "$mod" then
      return { MOD_ID = "${buildData.modId}", DEV = ${buildData.dev} }
  end
  if module == "ffi" then
      if not ____originalNoitaRequire then
          error("trying to load ffi from safe context (hint: add \`\\"noita.unsafe\\": true\` to package.json)")
      end
      return ____originalNoitaRequire(module)
  end
  local filename = (module:match('^data/.-%.lua$') or module:match('^mods/.-%.lua$'))
      and module
      or 'mods/${buildData.modId}/' .. module:gsub('%.', '/') .. '.lua'
  local cached = __loadonce[filename]
  if cached ~= nil then
      return cached[1]
  end
  local f, err = loadfile(filename)
  if f == nil then
      if ____originalNoitaRequire ~= nil then
      local result = ____originalNoitaRequire(module)
          __loadonce[filename] = { result }
          return result
      end
      return f, err
  end
  local env = setmetatable({}, { __index = _G })
  local result = setfenv(f, env)()
  local captured = {}
  for k, v in pairs(env) do captured[k] = v end
  if type(result) ~= 'table' then
      captured.default = result
      result = captured
  end
  __loadonce[filename] = { result }
  -- do_mod_appends(filename) -- figuring out setfenv setup for mod appends for now :(
  return result
end
`;

export default class NoitaRequirePlugin implements Plugin {
  private buildData: BuildData;
  private writeCallback: WriteCallback;

  constructor(buildData: BuildData, writeCallback: WriteCallback) {
    this.buildData = buildData;
    this.writeCallback = writeCallback;
  }

  afterPrint(
    _program: Program,
    options: CompilerOptions,
    _emitHost: EmitHost,
    result: ProcessedFile[],
  ) {
    const shim = mkShim(this.buildData);
    if (!options.luaBundle) {
      this.writeCallback("require_shim.lua", shim);
    }

    if (options.luaBundle) {
      for (const file of result) {
        file.code = shim + file.code;
        file.sourceMapNode = undefined;
      }
    } else {
      const prefix = `dofile_once('mods/${this.buildData.modId}/require_shim.lua')\n\n`;
      for (const file of result) {
        file.code = prefix + file.code;
      }
    }
  }
}

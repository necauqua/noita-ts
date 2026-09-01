import { Program } from "typescript";
import {
  CompilerOptions,
  EmitHost,
  Plugin,
  ProcessedFile,
} from "typescript-to-lua";
import type { BuildData } from "../mod.js";

type WriteCallback = (filePath: string, content: string) => void;

// `____originalRequire` is used by tstl bundler (and yes we end up having 2 require wrappers there)
const mkShim = (buildData: BuildData) => `
local ____originalNoitaRequire = require

local function shorten(name, from, to)
  local i = name:find(from, 1, true)
  if i == nil then
      return nil
  end
  return name:sub(1, i - 1) .. to .. name:sub(i + #from)
end

local mod_prefix = 'mods/${buildData.modId}/'
local chunk_prefix = '${buildData.dev ? "" : `${buildData.modId}/`}'

local function chunkname(filename)
  local name = filename
  if name:sub(1, #mod_prefix) == mod_prefix then
      name = chunk_prefix .. name:sub(#mod_prefix + 1)
  elseif name:sub(1, 5) == 'mods/' then
      name = name:sub(6)
  end
  return '@' .. (shorten(name, 'lua_modules/@noita-ts/', 'lib:nts/')
      or shorten(name, 'lua_modules/', 'lib:')
      or name)
end

function require(module)
  if module == "$mod" then
      return { MOD_ID = "${buildData.modId}", DEV = ${buildData.dev}, TEST = ${!!buildData.test} }
  end
  if module == "ffi" then
      if not ____originalNoitaRequire then
          error("trying to load ffi from safe context (hint: add \`\\"noita.unsafe\\": true\` to package.json)")
      end
      return ____originalNoitaRequire(module)
  end
  local filename = (module:match('^data/.-%.lua$') or module:match('^mods/.-%.lua$'))
      and module
      or mod_prefix .. module:gsub('%.', '/') .. '.lua'
  local cached = __loadonce[filename]
  if cached ~= nil then
      return cached[1]
  end
  local f, err
  if loadstring == nil then
      f, err = loadfile(filename)
  else
      -- unsafe mods have loadstring, allowing us to unjank the chunk names
      -- for better stack traces
      local content = ModTextFileGetContent(filename)
      if content == nil then
          err = filename .. ': file not found'
      else
          f, err = loadstring(content, chunkname(filename))
      end
  end
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

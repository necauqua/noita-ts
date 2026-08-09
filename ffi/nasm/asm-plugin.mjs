// TSTL plugin: turn `import patch from './file.asm'` into a real Lua module
// providing { asm, vars, labels } (see assemble.mjs).
//
// Wire it up in the consumer's tsconfig:
//
//   {
//     "tstl": {
//       "luaPlugins": [{ "name": "@noita-ts/ffi/asm-plugin" }]
//     }
//   }
//
// Types need no setup: `@noita-ts/ffi`'s own `src/index.d.ts` references
// `@noita-ts/ffi/asm`, which ships a generic `*.asm` fallback, so `.asm` imports
// type-check right after install. This plugin overwrites that shipped file in
// the installed copy (`<project>/node_modules/@noita-ts/ffi/nasm/asm.d.ts`) on
// each build, prepending a *concrete* block per imported .asm (precise
// `vars`/`labels` keys) before the generic fallback, so types sharpen after the
// first build.
//
// The Lua module itself is served entirely from memory (via the emit host) at a
// virtual `<file>.asm.lua` path next to the source: nothing is written to the
// source tree. TSTL emits it into the build output like any other dependency,
// mirroring the source layout, and rewrites the require to point at it.
//
// The plugin also implements @noita-ts/base's `excludeAsset` hook, so the `.asm`
// sources themselves are kept out of the packaged mod.

import { existsSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { assemble } from './assemble.mjs';
import { emitLua, emitTypesIndex, patternFor } from './codegen.mjs';

// virtual lua path -> generated module source
const virtualModules = new Map();
// emit hosts we've already wrapped, so readFile is patched at most once each
const patchedHosts = new WeakSet();
// ambient-module pattern -> assembled patch, for the concrete .d.ts blocks
const seenModules = new Map();
// assembly failures collected during moduleResolution, reported in beforeEmit
const failures = [];

// ts.DiagnosticCategory.Error
const DIAGNOSTIC_ERROR = 1;

/** A file-less ts.Diagnostic carrying just a message (printed without a stack). */
function errorDiagnostic(messageText) {
  return {
    category: DIAGNOSTIC_ERROR,
    code: 0,
    file: undefined,
    start: undefined,
    length: undefined,
    messageText,
  };
}

function patchEmitHost(emitHost) {
  if (patchedHosts.has(emitHost)) return;
  patchedHosts.add(emitHost);
  const originalReadFile = emitHost.readFile.bind(emitHost);
  emitHost.readFile = (path) =>
    virtualModules.has(path) ? virtualModules.get(path) : originalReadFile(path);
}

/**
 * Sharpen the `.asm` types of the installed `@noita-ts/ffi` by rewriting its
 * shipped `nasm/asm.d.ts` from the seen modules.
 *
 * Only ever touches a real installed copy: if the package is a symlink out of
 * `node_modules` (npm workspaces, `npm link`), the file belongs to a source
 * checkout shared by other projects, so it is left alone and the generic
 * fallback stays in effect.
 */
function writeAsmTypes(projectDir) {
  const nodeModules = join(projectDir, 'node_modules');
  const pkgDir = join(nodeModules, '@noita-ts', 'ffi');
  if (!existsSync(pkgDir)) return;
  if (!realpathSync(pkgDir).startsWith(nodeModules + sep)) return;
  writeFileSync(join(pkgDir, 'nasm', 'asm.d.ts'), emitTypesIndex(seenModules));
}

/** @type {import('typescript-to-lua').Plugin} */
const plugin = {
  moduleResolution(moduleIdentifier, requiringFile, _options, emitHost) {
    if (!moduleIdentifier.endsWith('.asm')) return undefined;

    const asmPath = isAbsolute(moduleIdentifier)
      ? moduleIdentifier
      : resolve(dirname(requiringFile), moduleIdentifier);

    // Virtual sibling of the source .asm: keeps the emitted module's path (and
    // thus its require path) mirroring the source layout, without any real file.
    const luaPath = `${asmPath}.lua`;
    patchEmitHost(emitHost);

    let patch;
    try {
      patch = assemble(asmPath);
    } catch (err) {
      // Report as a clean diagnostic (in beforeEmit) rather than throwing, which
      // would surface as an uncaught error with a node stack trace. Serve an
      // empty stub so nothing else cascades; the diagnostic fails the build.
      failures.push(errorDiagnostic(err?.message ?? String(err)));
      virtualModules.set(luaPath, emitLua({ asm: [], vars: {}, labels: {} }));
      return luaPath;
    }

    seenModules.set(patternFor(moduleIdentifier), patch);
    virtualModules.set(
      luaPath,
      emitLua(patch, `AUTO-GENERATED from ${moduleIdentifier}. Do not edit.`),
    );
    return luaPath;
  },

  beforeEmit(_program, _options, emitHost) {
    if (seenModules.size > 0) {
      writeAsmTypes(emitHost.getCurrentDirectory());
    }
    if (failures.length > 0) {
      return failures.splice(0);
    }
  },

  // @noita-ts/base hook: .asm sources are assembled into Lua modules at build
  // time, so the originals are build inputs and can be dropped from the final
  // mod package
  excludeAsset(relativePath) {
    return relativePath.endsWith('.asm');
  },
};

export default plugin;

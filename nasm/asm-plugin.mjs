// TSTL plugin: turn `import patch from './file.asm'` into a real Lua module
// providing a callable { raw, vars, labels } (see assemble.mjs and codegen.mjs).
//
// Wire it up in the consumer's tsconfig:
//
//   {
//     "tstl": {
//       "luaPlugins": [{ "name": "@noita-ts/nasm/asm-plugin" }]
//     }
//   }
//
// Types need no setup: this package's `asm.d.ts` (exported as
// `@noita-ts/nasm/asm`) ships a generic `*.asm` fallback, so `.asm` imports
// type-check right after install. On each build the plugin rewrites that file
// in the installed copy (`<project>/node_modules/@noita-ts/nasm/asm.d.ts`),
// prepending a *concrete* block per imported .asm (precise `vars`/`labels`
// keys) before the generic fallback, so types sharpen after the first build.
// Only this package's own files are ever written.
//
// The Lua module itself is served entirely from memory (via the emit host) at a
// virtual `<file>.asm.lua` path next to the source: nothing is written to the
// source tree. TSTL emits it into the build output like any other dependency,
// mirroring the source layout, and rewrites the require to point at it.
//
// The reloc linker shared by all patches is served the same way, as a single
// virtual `asm_link.lua` at the source root: patches require it by the sentinel
// specifier `@noita-ts/nasm/asm_link`, which this plugin resolves. TSTL scans
// emitted Lua for requires and runs them back through `moduleResolution`, so
// the module is emitted once and every patch's require is rewritten to it.
//
// The plugin also implements @noita-ts/base's `excludeAsset` hook, so the `.asm`
// sources themselves are kept out of the packaged mod.

import { existsSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { assemble } from './assemble.mjs';
import { emitLinkLua, emitLua, emitTypesIndex, LINK_MODULE, patternFor } from './codegen.mjs';

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
 * Sharpen the `.asm` types by rewriting this package's own shipped `asm.d.ts`
 * from the seen modules.
 *
 * Only ever touches a real installed copy: if the package is a symlink out of
 * `node_modules` (npm workspaces, `npm link`), the file belongs to a source
 * checkout shared by other projects, so it is left alone and the generic
 * fallback stays in effect.
 */
function writeAsmTypes(projectDir) {
  const nodeModules = join(projectDir, 'node_modules');
  const pkgDir = join(nodeModules, '@noita-ts', 'nasm');
  if (!existsSync(pkgDir)) return;
  if (!realpathSync(pkgDir).startsWith(nodeModules + sep)) return;
  writeFileSync(join(pkgDir, 'asm.d.ts'), emitTypesIndex(seenModules));
}

/**
 * Where TSTL bases emitted paths on: `rootDir` when set, else the project root.
 *
 * Mirrors TSTL's own `getSourceDir`, so a virtual module placed here lands at
 * the top of the output directory and gets a flat, stable require path.
 */
function sourceDir(options, emitHost) {
  const projectRoot = options?.configFilePath
    ? dirname(options.configFilePath)
    : emitHost.getCurrentDirectory();
  const rootDir = options?.rootDir;
  if (rootDir) {
    return isAbsolute(rootDir) ? rootDir : resolve(projectRoot, rootDir);
  }
  return projectRoot;
}

/** @type {import('typescript-to-lua').Plugin} */
const plugin = {
  moduleResolution(moduleIdentifier, requiringFile, options, emitHost) {
    // The linker shared by every generated patch. Emitted at the source root so
    // its require path is stable no matter how deep the requiring patch sits.
    if (moduleIdentifier === LINK_MODULE) {
      patchEmitHost(emitHost);
      const luaPath = join(sourceDir(options, emitHost), 'asm_link.lua');
      if (!virtualModules.has(luaPath)) {
        virtualModules.set(luaPath, emitLinkLua());
      }
      return luaPath;
    }

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

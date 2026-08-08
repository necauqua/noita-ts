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
// and reference the ambient types so TypeScript accepts `.asm` imports:
//
//   /// <reference types="@noita-ts/ffi/asm" />
//
// When TSTL resolves the `require("./file.asm")` emitted for such an import, the
// `moduleResolution` hook assembles the .asm and serves the resulting Lua module
// entirely from memory (via the emit host) at a virtual `<file>.asm.lua` path
// next to the source. Nothing is written to the source tree or to disk: TSTL
// emits the module into the build output like any other dependency, mirroring
// the source layout, and rewrites the require to point at it.

import { isAbsolute, resolve, dirname } from 'node:path';
import { assemble } from './assemble.mjs';
import { emitLua } from './codegen.mjs';

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
      emitLua(assemble(asmPath), `AUTO-GENERATED from ${moduleIdentifier}. Do not edit.`),
    );
    return luaPath;
  },

  beforeEmit(_program, _options, emitHost) {
    if (seenModules.size > 0) {
      writeTypesPackage(emitHost.getCurrentDirectory());
    }
    if (failures.length > 0) {
      return failures.splice(0);
    }
  },
};

export default plugin;

// TSTL plugin: turn an inline `asm(`...`)` call into a callable
// { raw, vars, labels } (see assemble.mjs and codegen.mjs).
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
// `@noita-ts/nasm/asm`) declares the global `asm` function, so a block needs no
// import and emits no require of its own. Its reloc and label names are parsed
// from the source at the type level, by the types in that same file.
//
// A visitor for call expressions spots the global `asm`, assembles its string
// argument, and replaces the call with the patch table itself.
//
// The reloc linker shared by all patches is served from memory (via the emit
// host) as a single virtual `asm_link.lua` at the source root: patches require
// it by the sentinel specifier `@noita-ts/nasm/link`, which this plugin
// resolves. TSTL scans emitted Lua for requires and runs them back through
// `moduleResolution`, so the module is emitted once and every patch's require is
// rewritten to it.

import { createRequire } from 'node:module';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assemble } from './assemble.mjs';
import { buildPatchExpression, emitLinkLua, LINK_MODULE } from './codegen.mjs';

/**
 * Load a package that belongs to the *consuming* project, preferring its copy
 * over any that happens to sit next to this file.
 *
 * `typescript` and `typescript-to-lua` are peers here: the plugin has to build
 * AST nodes for the very compiler running it, and a second copy would mean
 * mismatched `SyntaxKind` values. So resolution starts at the cwd (the project
 * being built) and only falls back to this package's own location.
 */
function loadPeer(name) {
  const req = createRequire(import.meta.url);
  const paths = [process.cwd(), dirname(fileURLToPath(import.meta.url))];
  return req(req.resolve(name, { paths }));
}

const ts = loadPeer('typescript');
const lua = loadPeer('typescript-to-lua');

/** This package's ambient declaration file, where the `asm` function is declared. */
const ASM_TYPES = 'asm.d.ts';

// virtual lua path -> emitted module source
const virtualModules = new Map();
// emit hosts we've already wrapped, so readFile is patched at most once each
const patchedHosts = new WeakSet();

// ts.DiagnosticCategory.Error
const DIAGNOSTIC_ERROR = 1;

/** A ts.Diagnostic pointing at `node`, so the error is shown in context. */
function nodeDiagnostic(node, messageText) {
  return {
    category: DIAGNOSTIC_ERROR,
    code: 0,
    file: node.getSourceFile(),
    start: node.getStart(),
    length: node.getEnd() - node.getStart(),
    messageText,
  };
}

/**
 * Whether `callee` is the global `asm` declared by this package's ambient types,
 * rather than some unrelated local named `asm`.
 */
function isAsmCallee(callee, checker) {
  if (!ts.isIdentifier(callee) || callee.text !== 'asm') return false;
  const declarations = checker.getSymbolAtLocation(callee)?.declarations;
  return (
    declarations?.some((d) => basename(d.getSourceFile().fileName) === ASM_TYPES) ?? false
  );
}

/** Assembled inline blocks, keyed by source text, so each is assembled once. */
const inlineCache = new Map();

/** An empty patch, spliced in after an error so nothing downstream cascades. */
const EMPTY_PATCH = { asm: [], vars: {}, labels: {} };

/**
 * Assemble an inline `asm(`...`)` block into the patch table expression.
 *
 * Only a constant string can be assembled, since the bytes are baked at build
 * time; the declared type of `asm` rejects anything else too, so this is the
 * backstop for when types are ignored.
 */
function transformInlineAsm(node, context) {
  const [argument] = node.arguments;
  if (
    node.arguments.length !== 1 ||
    !(ts.isNoSubstitutionTemplateLiteral(argument) || ts.isStringLiteral(argument))
  ) {
    context.diagnostics.push(
      nodeDiagnostic(
        argument ?? node,
        'an inline asm block is assembled at build time, so it must be a single ' +
          'constant string (a template literal without ${...} substitutions)',
      ),
    );
    return buildPatchExpression(lua, EMPTY_PATCH, node);
  }

  const source = argument.text;
  let patch = inlineCache.get(source);
  if (patch === undefined) {
    const file = node.getSourceFile();
    // The string's first line continues the line its opening quote is on, so
    // nasm's line N maps to that (1-based) line plus N - 1.
    const lineOffset = file.getLineAndCharacterOfPosition(argument.getStart()).line;
    const label = relative(process.cwd(), file.fileName);
    try {
      patch = assemble(source, { label, lineOffset });
    } catch (err) {
      // The diagnostic itself already points at the block, so report just nasm's
      // own output (whose line numbers are mapped back onto this file).
      context.diagnostics.push(
        nodeDiagnostic(node, err?.nasmOutput ?? err?.message ?? String(err)),
      );
      return buildPatchExpression(lua, EMPTY_PATCH, node);
    }
    inlineCache.set(source, patch);
  }
  return buildPatchExpression(lua, patch, node);
}

function patchEmitHost(emitHost) {
  if (patchedHosts.has(emitHost)) return;
  patchedHosts.add(emitHost);
  const originalReadFile = emitHost.readFile.bind(emitHost);
  emitHost.readFile = (path) =>
    virtualModules.has(path) ? virtualModules.get(path) : originalReadFile(path);
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
  visitors: {
    // `asm(`...`)` becomes the assembled { raw, vars, labels } table right where
    // it is written. Every other call is left to the standard visitor.
    [ts.SyntaxKind.CallExpression]: (node, context) =>
      isAsmCallee(node.expression, context.checker)
        ? transformInlineAsm(node, context)
        : context.superTransformExpression(node),
  },

  moduleResolution(moduleIdentifier, _requiringFile, options, emitHost) {
    // The linker shared by every patch. Emitted at the source root so its
    // require path is stable no matter how deep the requiring file sits.
    if (moduleIdentifier !== LINK_MODULE) return undefined;
    patchEmitHost(emitHost);
    const luaPath = join(sourceDir(options, emitHost), 'asm_link.lua');
    if (!virtualModules.has(luaPath)) {
      virtualModules.set(luaPath, emitLinkLua());
    }
    return luaPath;
  },
};

export default plugin;

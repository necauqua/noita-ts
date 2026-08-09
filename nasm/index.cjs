// Resolves the `nasm` executable from the platform package matching the current
// OS/CPU.
//
// The binaries live in per-platform packages (`@noita-ts/nasm-<os>-<cpu>`) listed
// as `optionalDependencies` with `os`/`cpu` fields, so npm downloads only the one
// for the current machine and silently skips the rest.
//
// CommonJS so that consumers can resolve the path synchronously (the TSTL plugin
// hook that assembles patches is sync); `index.mjs` re-exports this for ESM.

const PLATFORMS = {
  'linux-x64': '@noita-ts/nasm-linux-x64',
  'win32-x64': '@noita-ts/nasm-win32-x64',
};

const key = `${process.platform}-${process.arch}`;
const pkg = PLATFORMS[key];

if (!pkg) {
  throw new Error(
    `@noita-ts/nasm has no prebuilt nasm for ${key}; ` +
      `supported platforms: ${Object.keys(PLATFORMS).join(', ')}.`,
  );
}

const binary = process.platform === 'win32' ? 'nasm.exe' : 'nasm';

let resolved;
try {
  resolved = require.resolve(`${pkg}/${binary}`);
} catch {
  // The optional dependency was skipped: either the install ran with
  // --no-optional, or node_modules/the lockfile came from another platform.
  throw new Error(
    `${pkg} is not installed, so nasm is unavailable on ${key}.\n` +
      `It is an optional dependency of @noita-ts/nasm; reinstall on this ` +
      `machine (and without --no-optional) to fetch it.`,
  );
}

/** Absolute path to the bundled `nasm` executable for the current platform. */
exports.nasmPath = resolved;

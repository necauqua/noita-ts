// Root shim so `{ "name": "@noita-ts/ffi/asm-plugin" }` resolves under TSTL,
// whose plugin loader uses the classic `resolve` package (which ignores the
// package.json "exports" map and only tries .js/.ts/.tsx). Re-exports the real
// ESM plugin from nasm/.
export { default } from './nasm/asm-plugin.mjs';

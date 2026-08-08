// @types/noita-ts — global ambient typings for Noita TypeScript mods.
//
// This package installs into `node_modules/@types/noita-ts` and is picked up by
// TypeScript's automatic @types discovery, so simply depending on it makes the
// Noita API, the Lua stdlib and the TSTL language extensions available globally
// (no `types` array pin required). @noita-ts/base depends on it.
/// <reference types="lua-types/jit" />
/// <reference types="@typescript-to-lua/language-extensions" />
/// <reference path="./api.d.ts" />

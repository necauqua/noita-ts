# Unsafe mods and the native packages

## Unsafe mods

`"noita.unsafe": true` in `package.json` writes
`request_no_api_restrictions="1"` into `mod.xml`. Such a mod has the LuaJIT
`ffi`, `io`, `os`, `loadstring` and `require` of native modules, so it can
read and patch the memory of the game. The player must allow unsafe mods in
the mod menu, and Noita does not load an unsafe mod from the Steam Workshop
without a DLL patch, so such mods are usually installed by hand.

`import ffi from "@noita-ts/ffi"` in a safe mod fails at load with a hint to
set `noita.unsafe`. The headless test image allows unsafe mods, so `nts test`
works for them.

The game is a 32-bit Windows program (it runs in Wine/Proton on Linux):
pointers are 4 bytes, and native code is x86.

## `@noita-ts/ffi`

The LuaJIT FFI (`cdef`, `cast`, `new`, `string`, `C`, `load`, ...) plus
helpers to find and patch code in `noita.exe`. Read
`node_modules/@noita-ts/ffi/dist/index.d.ts`; each function has full notes.

- **Find code by byte patterns, not by addresses.** Addresses change with
  each game build. `ffi.scan(needle, { at, back, limit, skip, name })` scans
  `.text` (code), `ffi.text/.data/.rdata.scanAll` a whole section;
  `ffi._` is a wildcard byte. `ffi.locateString`, `ffi.locateStringPush`
  (the `PUSH` of a string, a good anchor), `ffi.locateVftable` and
  `ffi.locateStaticGlobal` (by RTTI name) find anchors. Give each scan a
  `name`, so that its error tells which one failed. `ffi.instrLen(addr)`
  gives the length of an instruction.
- **Patch.** `ffi.patchRaw(addr, bytes)`, `ffi.patch(needle, bytes, params)`,
  `ffi.cave(addr, bytes)` (jump to new code, then back), and
  `ffi.hook(addr, (regs) => ...)` (call Lua with the registers; only on code
  that runs on the thread of the mod, and slow on hot code).
  `ffi.allocExec(size)` gives executable memory.
- **Lua states and lifetime.** Every Lua state of a mod loads its modules
  again (and the state of the mod is made again for each new game), but
  patches stay in the process. Hooks, caves and `allocExec` memory are undone
  when the state that made them closes, unless `{ persistent: true }`. Guard a
  patch that must happen once per game process with `ffi.once("<mod id>.name")`
  and make it persistent. `ffi.store` keeps strings for the whole process,
  shared by all mods. A restart of the game (a new `noita.exe`) starts
  without the `once` flags and the `store` values of the old process. `ffi.onRelease(fn)` runs `fn` when the state closes.
  Put the mod id into every `once` and `store` name.
- **Structs.** Describe engine structs with `@noita-ts/ffi/schema`
  (`c.declare("Name", [c.field("x", c.i32), c.unknown(4), ...])`, then
  `.ptr()`, `.cast(addr)`, `.size`, `typeof T.type`), not with an `ffi.cdef`
  string and a separate TypeScript type. `@noita-ts/ffi/cpp` has
  `NativeString` (`std::string`), `Vec` (`std::vector`), `Vec2` and more.
- **Engine globals**, already located: `@noita-ts/ffi/magic-numbers`
  (`magicNumbers.NAME[0] = value`), `/game-global`, `/platform`,
  `/global-stats`, `/death-match`, `/entity-manager`, `/mods` (the loaded
  mods; `MOD_CONTEXT.loadDll("path/in/mod.dll")` loads a DLL that the mod
  ships, also from the Workshop folder).
- A `Ptr<T>` is indexed like C: `ptr[0]` is the first element (TSTL adds 1
  only for arrays).
- A read of a bad pointer crashes the game; `nts test` then reports that the
  game died.

## `@noita-ts/nasm`: inline x86 assembly

```sh
npm i -D @noita-ts/nasm
```

```jsonc
// tsconfig.json
{
  "extends": "@noita-ts/base/mod-tsconfig.json",
  "tstl": { "luaPlugins": [{ "name": "@noita-ts/nasm/asm-plugin" }] }
}
```

```ts
/// <reference types="@noita-ts/nasm/asm" />
const patch = asm(`
target: reloc          ; a 32-bit value that is given at run time
entry:
    mov eax, [target]
`);
ffi.cave(addr, patch({ target: someAddress }));
```

The build assembles each `asm()` (NASM, MASM syntax), so the string must be a
constant: give run-time values through `name: reloc`. NASM errors show as
TypeScript errors. Read `node_modules/@noita-ts/nasm/asm-plugin.md`.

## `@noita-ts/pollnet`

[pollnet](https://github.com/probable-basilisk/pollnet) (WebSockets, TCP,
HTTP) with a 3.5 MB DLL that the build ships in the mod. `@noita-ts/pollnet`
exports `HttpClient`, `WebSocket` and `runServer` (they take a `Scheduler`);
`@noita-ts/pollnet/api` is the raw API.

## `@noita-ts/crypto`

Hashes and secure random bytes from the CNG of Windows (`bcrypt.dll`), with
no DLL to ship: `md5`, `sha1`, `sha256`, `sha384` and `sha512` give raw
bytes, and the HMAC with a second argument (`sha256(data, key)`); `md5` and
`sha1` are only for compatibility, not for security; `toHex`/`fromHex`
convert; `new Hasher("sha256", key?).update(a).update(b).digest()` hashes
data in parts; `randomBytes(n)` is for keys and tokens (not `math.random`).
Nothing throws: a function that fails (bad input, a CNG error, a second
`digest()`) gives `undefined`. A string literal is UTF-8 in Lua, so give
bytes above 0x7f with `string.char` or `fromHex`. The separate entry point
`@noita-ts/crypto/ed25519` verifies Ed25519 signatures in plain Lua (about
8 ms each): `verify(publicKey, message, signature)` with raw bytes, and
`verifySsh(pubLine, namespace, message, sigText)` for `ssh-keygen -Y sign`
(also FIDO keys, for example a YubiKey); anything that is not a valid
signature by that key gives `false`. Read
`node_modules/@noita-ts/crypto/readme.md`.

## `@noita-ts/noita-dear-imgui-types`

Types for [Noita-Dear-ImGui](https://github.com/dextercd/Noita-Dear-ImGui)
(`load_imgui`), a separate unsafe mod that must be installed and loaded
before your mod. The types are global: add
`/// <reference types="@noita-ts/noita-dear-imgui-types" />` to a source
file.

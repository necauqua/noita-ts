# @noita-ts/crypto

Hashes, HMAC and secure random bytes for unsafe
[noita-ts](https://github.com/necauqua/noita-ts) mods through the LuaJIT FFI,
from CNG (`bcrypt.dll`). CNG is part of Windows (and of Wine), so there is no
DLL to ship.

The package exports one function for each hash (`md5`, `sha1`, `sha256`,
`sha384`, `sha512`), `Hasher` for data in parts, `toHex`, `fromHex` and
`randomBytes`.

Nothing in the package throws. A function that fails (bad input, an error
of CNG, a second `digest()`) gives `undefined`, so its type is
`string | undefined`.

```ts
import { Hasher, randomBytes, sha256, toHex } from "@noita-ts/crypto";

const hash = sha256("abc");
if (hash !== undefined) {
  print(toHex(hash)); // ba7816bf...
}

// for example the signature of a webhook: the HMAC with a key
const signature = sha256(body, secret);

// a hash of data that comes in parts: the same as sha256("abc")
const digest = new Hasher("sha256").update("a").update("bc").digest();

// for example the state of an OAuth request
const state = randomBytes(16);
```

## Hashes and HMAC

- `sha256(data)` is the hash of the string `data`, as raw bytes (a Lua string
  of 32 bytes; 16 for MD5, 20 for SHA-1, 48 for SHA-384, 64 for SHA-512),
  or `undefined` when CNG fails. Use `toHex` to get hex.
- `sha256(data, key)` is the HMAC of `data` with the string `key`. A key of
  any length is correct, also an empty key.
- `new Hasher(algorithm, key?)` takes the data in parts. `algorithm` is
  `"md5"`, `"sha1"`, `"sha256"`, `"sha384"` or `"sha512"` (the type
  `HashAlgorithm`); with `key`, the result is the HMAC. Call `update(data)`
  for each part (it returns the hasher), and then `digest()` once. A
  hasher gives its hash once: after `digest()`, `update` does nothing and
  `digest()` gives `undefined`. `digest()` also gives `undefined` when the
  algorithm is not known, or when a call of CNG failed.
- A hasher that is not finished keeps a CNG handle. The garbage collector
  destroys it, and so does the close of the Lua state.
- Strings are bytes in Lua, so `data` and `key` can have any bytes. A
  string literal of TypeScript is UTF-8 in Lua: `"\xff"` is 2 bytes. Use
  `string.char(0xff)` or `fromHex` for bytes above 0x7f.
- MD5 and SHA-1 are broken as cryptographic hashes: an attacker can make two
  inputs with the same hash. They are here only for compatibility, and for
  purposes that are not cryptographic: for example a checksum that is
  published as MD5, a git object id, the `Sec-WebSocket-Accept` of a
  WebSocket, or a name-based UUID. Do not use them for signatures,
  passwords, or data that an attacker can change; use SHA-256 or larger.
  Collisions do not break their HMAC in the same way, but new code should
  use HMAC-SHA256 too.

## Hex

- `toHex(bytes)` gives lower-case hex, two digits for each byte.
- `fromHex(hex)` gives the bytes of a hex string (in any case), or
  `undefined` when the string has other characters, or an odd number of
  digits.

## Random bytes

`randomBytes(count)` gives `count` bytes from the secure random generator of
the system (`BCryptGenRandom` with `BCRYPT_USE_SYSTEM_PREFERRED_RNG`), or
`undefined` when `count` is not a whole number from 0 to 0xffffffff, or when
CNG fails. Use it for keys, tokens and the `state` of an OAuth request, not
`math.random`.

## How it works

- All the calls of CNG return at once, so the game does not stop, and no
  native code runs in CNG after the Lua state is closed.
- An algorithm provider of CNG (one for each hash, and one for each HMAC) is
  opened when it is first used, once for the whole game process, and is
  never closed. Every Lua state and every mod gets it from `ffi.store`
  (the names start with `crypto.provider.`). Thus there are at most 10 open
  providers, also after many new games.
- The API is in Windows since Vista (in Wine too): CNG allocates the hash
  objects itself, which needs Windows 7 or later.

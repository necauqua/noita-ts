// Hashes, HMAC and secure random bytes from CNG (`bcrypt.dll`, part of
// Windows and of Wine, so there is no DLL to ship). Nothing here throws: a
// call that fails, for example in CNG, gives `undefined`.

import ffi from "@noita-ts/ffi";

// the results are NTSTATUS values, 0 on success (STATUS_SUCCESS)
ffi.cdef(`
  int32_t BCryptOpenAlgorithmProvider(void** algorithm, const uint16_t* id, const uint16_t* implementation, uint32_t flags);
  int32_t BCryptCreateHash(void* algorithm, void** hash, uint8_t* object, uint32_t objectLength, const char* secret, uint32_t secretLength, uint32_t flags);
  int32_t BCryptHashData(void* hash, const char* input, uint32_t length, uint32_t flags);
  int32_t BCryptFinishHash(void* hash, uint8_t* output, uint32_t length, uint32_t flags);
  int32_t BCryptDestroyHash(void* hash);
  int32_t BCryptGenRandom(void* algorithm, uint8_t* buffer, uint32_t length, uint32_t flags);
`);

// all the calls return at once, so no native code runs in CNG after the Lua
// state is closed, and the state can free this library handle
const bcrypt = ffi.load("bcrypt.dll");

/** A hash algorithm of CNG. */
interface Algorithm {
  /** The CNG identifier, for example `SHA256`. */
  id: string;
  /** The length of a hash, in bytes. */
  size: number;
}

/**
 * The name of a hash algorithm. `md5` and `sha1` are broken, and are only
 * for compatibility and for purposes that are not cryptographic (see
 * {@link md5} and {@link sha1}).
 */
export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";

const ALGORITHMS: Record<HashAlgorithm, Algorithm> = {
  md5: { id: "MD5", size: 16 },
  sha1: { id: "SHA1", size: 20 },
  sha256: { id: "SHA256", size: 32 },
  sha384: { id: "SHA384", size: 48 },
  sha512: { id: "SHA512", size: 64 },
};

const BCRYPT_ALG_HANDLE_HMAC_FLAG = 0x8;

/** The providers that this Lua state got from the store, by their name. */
const providers = new LuaTable<string, unknown>();

/** `s` (ASCII) as a wide string with a terminating zero. */
const wide = (s: string) => {
  const w = ffi.new("uint16_t[?]", s.length + 1);
  for (let i = 0; i < s.length; i++) {
    w[i] = string.byte(s, i + 1);
  }
  return w;
};

/**
 * The provider of `id`, for HMAC when `hmac` is true, or `undefined` when
 * CNG cannot open it.
 *
 * Each provider is opened once per game process, and is never closed: every
 * Lua state and every mod (also with another version of this package) gets
 * its address (as decimal text) from `ffi.store`. Thus a provider lives
 * longer than all of its hashes, and the meaning of a name in the store must
 * never change.
 */
const provider = (id: string, hmac: boolean) => {
  const name = `crypto.provider.${hmac ? "HMAC-" : ""}${id}`;
  let handle = providers.get(name);
  if (handle !== undefined) {
    return handle;
  }
  let address = ffi.store.get(name);
  if (address === undefined) {
    const out = ffi.new("void*[1]");
    const flags = hmac ? BCRYPT_ALG_HANDLE_HMAC_FLAG : 0;
    if (bcrypt.BCryptOpenAlgorithmProvider(out, wide(id), undefined, flags) !== 0) {
      return undefined;
    }
    address = tostring(tonumber(ffi.cast("uintptr_t", out[0])));
    ffi.store.set(name, address);
  }
  handle = ffi.cast("void*", tonumber(address));
  providers.set(name, handle);
  return handle;
};

/**
 * A new hash handle of `alg` (an HMAC with `key` when `key` is given), or
 * `undefined` when CNG cannot make it.
 */
const create = (alg: Algorithm, key: string | undefined): unknown => {
  const algorithm = provider(alg.id, key !== undefined);
  if (algorithm === undefined) {
    return undefined;
  }
  const out = ffi.new("void*[1]");
  const length = key === undefined ? 0 : key.length;
  // a null object buffer makes CNG allocate the object itself
  if (bcrypt.BCryptCreateHash(algorithm, out, undefined, 0, key, length, 0) !== 0) {
    return undefined;
  }
  return out[0];
};

/** Adds `data` to the hash; false when CNG fails. */
const feed = (handle: unknown, data: string) => bcrypt.BCryptHashData(handle, data, data.length, 0) === 0;

/** The hash of `size` bytes, or `undefined` when CNG fails. */
const finish = (handle: unknown, size: number) => {
  const out = ffi.new("uint8_t[?]", size);
  if (bcrypt.BCryptFinishHash(handle, out, size, 0) !== 0) {
    return undefined;
  }
  return ffi.string(out, size);
};

/**
 * The hash of `data` with `alg` (an HMAC with `key` when `key` is given),
 * as raw bytes, or `undefined` when CNG fails.
 */
const digest = (alg: Algorithm, key: string | undefined, data: string) => {
  const handle = create(alg, key);
  if (handle === undefined) {
    return undefined;
  }
  const result = feed(handle, data) ? finish(handle, alg.size) : undefined;
  bcrypt.BCryptDestroyHash(handle);
  return result;
};

/**
 * A hash that takes its data in parts: call `update` for each part, and
 * then `digest` once. For data in one part, the functions `sha256` and
 * the others are shorter.
 */
export class Hasher {
  /**
   * The hash handle; `undefined` after the digest, or when the algorithm is
   * not known or a call of CNG failed.
   */
  private handle: unknown;
  private readonly size: number;

  /**
   * @param algorithm The hash algorithm
   * @param key The key of an HMAC; without it, a plain hash
   */
  constructor(algorithm: HashAlgorithm, key?: string) {
    const alg = (ALGORITHMS as Record<string, Algorithm | undefined>)[algorithm];
    const handle = alg === undefined ? undefined : create(alg, key);
    this.handle = handle === undefined ? undefined : ffi.gc(handle, bcrypt.BCryptDestroyHash);
    this.size = alg === undefined ? 0 : alg.size;
  }

  /** Destroys the handle; after this, the hasher gives no hash. */
  private close() {
    const handle = this.handle;
    if (handle !== undefined) {
      this.handle = undefined;
      ffi.gc(handle, undefined);
      bcrypt.BCryptDestroyHash(handle);
    }
  }

  /**
   * Adds `data` to the hashed data. After `digest`, or after a call of CNG
   * failed, it does nothing.
   */
  update(data: string): this {
    if (this.handle !== undefined && !feed(this.handle, data)) {
      this.close();
    }
    return this;
  }

  /**
   * The hash of all the data, as raw bytes. A hasher gives its hash once:
   * this is `undefined` after the first `digest`, and also when the
   * algorithm is not known or a call of CNG failed.
   */
  digest(): string | undefined {
    if (this.handle === undefined) {
      return undefined;
    }
    const result = finish(this.handle, this.size);
    this.close();
    return result;
  }
}

// one-shot hashes

/**
 * The MD5 hash of `data`, or its HMAC with `key` when `key` is given:
 * 16 raw bytes, or `undefined` when CNG fails.
 *
 * MD5 is broken as a cryptographic hash: an attacker can make two inputs
 * with the same hash. It is here only for compatibility, and for purposes
 * that are not cryptographic: for example a checksum that is published as
 * MD5, an old API that wants MD5, or a name-based UUID (version 3). Do not
 * use it for signatures, passwords, or data that an attacker can change;
 * use SHA-256 or larger. Collisions do not break its HMAC in the same way,
 * but new code should use HMAC-SHA256 too.
 */
export const md5 = (data: string, key?: string) => digest(ALGORITHMS.md5, key, data);

/**
 * The SHA-1 hash of `data`, or its HMAC with `key` when `key` is given:
 * 20 raw bytes, or `undefined` when CNG fails.
 *
 * SHA-1 is broken as a cryptographic hash: an attacker can make two inputs
 * with the same hash. It is here only for compatibility, and for purposes
 * that are not cryptographic: for example a git object id, the
 * `Sec-WebSocket-Accept` of a WebSocket, or a name-based UUID (version 5).
 * Do not use it for signatures, passwords, or data that an attacker can
 * change; use SHA-256 or larger. Collisions do not break its HMAC in the
 * same way, but new code should use HMAC-SHA256 too.
 */
export const sha1 = (data: string, key?: string) => digest(ALGORITHMS.sha1, key, data);

/**
 * The SHA-256 hash of `data`, or its HMAC with `key` when `key` is given:
 * 32 raw bytes, or `undefined` when CNG fails.
 */
export const sha256 = (data: string, key?: string) => digest(ALGORITHMS.sha256, key, data);

/**
 * The SHA-384 hash of `data`, or its HMAC with `key` when `key` is given:
 * 48 raw bytes, or `undefined` when CNG fails.
 */
export const sha384 = (data: string, key?: string) => digest(ALGORITHMS.sha384, key, data);

/**
 * The SHA-512 hash of `data`, or its HMAC with `key` when `key` is given:
 * 64 raw bytes, or `undefined` when CNG fails.
 */
export const sha512 = (data: string, key?: string) => digest(ALGORITHMS.sha512, key, data);

// hex

/** The bytes of `bytes` as lower-case hex, two digits for each byte. */
export const toHex = (bytes: string) =>
  string.gsub(bytes, ".", (c) => string.format("%02x", string.byte(c)))[0];

/**
 * The bytes of the hex string `hex` (in any case), or `undefined` when
 * `hex` has other characters, or an odd number of digits.
 */
export const fromHex = (hex: string): string | undefined => {
  if (hex.length % 2 !== 0 || string.find(hex, "%X")[0] !== undefined) {
    return undefined;
  }
  return string.gsub(hex, "..", (pair) => string.char(tonumber(pair, 16)!))[0];
};

// random bytes

const BCRYPT_USE_SYSTEM_PREFERRED_RNG = 0x2;

/**
 * `count` random bytes from the secure random generator of the system, for
 * example for a key, a token or the `state` of an OAuth request. It is
 * `undefined` when `count` is not a whole number from 0 to 0xffffffff, or
 * when CNG fails.
 */
export const randomBytes = (count: number): string | undefined => {
  if (count !== math.floor(count) || count < 0 || count > 0xffffffff) {
    return undefined;
  }
  if (count === 0) {
    return "";
  }
  const buffer = ffi.new("uint8_t[?]", count);
  if (bcrypt.BCryptGenRandom(undefined, buffer, count, BCRYPT_USE_SYSTEM_PREFERRED_RNG) !== 0) {
    return undefined;
  }
  return ffi.string(buffer, count);
};

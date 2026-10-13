// Ed25519 signature verification (RFC 8032) in plain Lua, and the
// signatures of `ssh-keygen -Y sign` with Ed25519 keys, FIDO keys too.
//
// The curve math is a port of TweetNaCl (public domain). A field element
// has 16 limbs of 16 bits in Lua numbers; a product of limbs stays below
// 2^53, so the math on doubles is exact. A verification uses only public
// data, so it does not need constant time. The checks are lean: the
// code rejects `S >= L` and points that do not decode, but it accepts the
// rare encodings that are not canonical (as TweetNaCl does). Nothing here
// throws: anything that is not a valid signature gives `false`.

import { decode } from "@noita-ts/base/base64";
import { sha256, sha512 } from "./index";

const { floor } = math;

/** A field element mod 2^255 - 19: 16 limbs, the lowest first. */
type Gf = number[];

const gf = (): Gf => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const ONE: Gf = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const D: Gf = [
  0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,
  0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203,
];
const D2: Gf = [
  0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,
  0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406,
];
/** The square root of -1. */
const I: Gf = [
  0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,
  0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83,
];
const BASE_X: Gf = [
  0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,
  0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169,
];
const BASE_Y: Gf = [
  0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
  0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
];
/** The order of the group, as 32 bytes, the lowest first. */
const L = [
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10,
];

const copy = (a: Gf): Gf => {
  const o = gf();
  for (let i = 0; i < 16; i++) {
    o[i] = a[i];
  }
  return o;
};

/** Moves the bits above 16 of each limb to the next limb. */
const carry = (o: Gf) => {
  for (let i = 0; i < 16; i++) {
    o[i] += 65536;
    const c = floor(o[i] / 65536);
    o[i] -= c * 65536;
    if (i < 15) {
      o[i + 1] += c - 1;
    } else {
      o[0] += 38 * (c - 1);
    }
  }
};

const add = (o: Gf, a: Gf, b: Gf) => {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] + b[i];
  }
};

const sub = (o: Gf, a: Gf, b: Gf) => {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] - b[i];
  }
};

const mul = (o: Gf, a: Gf, b: Gf) => {
  const t: number[] = [];
  for (let i = 0; i < 31; i++) {
    t[i] = 0;
  }
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      t[i + j] += a[i] * b[j];
    }
  }
  // 2^256 = 38 mod p
  for (let i = 0; i < 15; i++) {
    t[i] += 38 * t[i + 16];
  }
  for (let i = 0; i < 16; i++) {
    o[i] = t[i];
  }
  carry(o);
  carry(o);
};

/** `a` to the power 2^255 - 21 (the inverse) or 2^252 - 3 (for a root). */
const pow = (o: Gf, a: Gf, inverse: boolean) => {
  const c = copy(a);
  for (let i = inverse ? 253 : 250; i >= 0; i--) {
    mul(c, c, c);
    if (inverse ? i !== 2 && i !== 4 : i !== 1) {
      mul(c, c, a);
    }
  }
  for (let i = 0; i < 16; i++) {
    o[i] = c[i];
  }
};

/** `n` with each limb below 2^16, and the value below p. */
const freeze = (n: Gf) => {
  let t = copy(n);
  carry(t);
  carry(t);
  carry(t);
  for (let j = 0; j < 2; j++) {
    const m = gf();
    m[0] = t[0] - 0xffed;
    for (let i = 1; i < 16; i++) {
      const borrow = m[i - 1] < 0 ? 1 : 0;
      m[i] = t[i] - (i < 15 ? 0xffff : 0x7fff) - borrow;
      m[i - 1] += borrow * 65536;
    }
    if (m[15] >= 0) {
      t = m;
    }
  }
  return t;
};

const equal = (a: Gf, b: Gf) => {
  const [fa, fb] = [freeze(a), freeze(b)];
  for (let i = 0; i < 16; i++) {
    if (fa[i] !== fb[i]) {
      return false;
    }
  }
  return true;
};

const parity = (a: Gf) => freeze(a)[0] % 2;

/** A point in extended coordinates: X, Y, Z and T. */
type Point = [Gf, Gf, Gf, Gf];

/** Sets `p` to `p + q`; `q` can be `p`. */
const addPoint = (p: Point, q: Point) => {
  const [a, b, c, d, t, e, f, g, h] = [gf(), gf(), gf(), gf(), gf(), gf(), gf(), gf(), gf()];
  sub(a, p[1], p[0]);
  sub(t, q[1], q[0]);
  mul(a, a, t);
  add(b, p[0], p[1]);
  add(t, q[0], q[1]);
  mul(b, b, t);
  mul(c, p[3], q[3]);
  mul(c, c, D2);
  mul(d, p[2], q[2]);
  add(d, d, d);
  sub(e, b, a);
  sub(f, d, c);
  add(g, d, c);
  add(h, b, a);
  mul(p[0], e, f);
  mul(p[1], h, g);
  mul(p[2], g, f);
  mul(p[3], e, h);
};

const BASE: Point = [BASE_X, BASE_Y, ONE, gf()];
mul(BASE[3], BASE_X, BASE_Y);

/** The 32-byte encoding of `p`. */
const encode = (p: Point) => {
  const z = gf();
  const x = gf();
  const y = gf();
  pow(z, p[2], true);
  mul(x, p[0], z);
  mul(y, p[1], z);
  const t = freeze(y);
  t[15] += 32768 * parity(x);
  let out = "";
  for (let i = 0; i < 16; i++) {
    out += string.char(t[i] % 256, floor(t[i] / 256));
  }
  return out;
};

/** The negative of the point that `s` (32 bytes) encodes, or `undefined`. */
const decodeNegative = (s: string): Point | undefined => {
  const y = gf();
  for (let i = 0; i < 16; i++) {
    const [lo, hi] = string.byte(s, 2 * i + 1, 2 * i + 2);
    y[i] = lo + 256 * hi;
  }
  y[15] %= 32768;
  // x^2 = (y^2 - 1) / (d y^2 + 1)
  const [num, den, t, x, chk] = [gf(), gf(), gf(), gf(), gf()];
  mul(num, y, y);
  mul(den, num, D);
  sub(num, num, ONE);
  add(den, den, ONE);
  // x = num den^3 (num den^7)^((p - 5) / 8)
  const den2 = gf();
  const den6 = gf();
  mul(den2, den, den);
  mul(den6, den2, den2);
  mul(den6, den6, den2);
  mul(t, den6, num);
  mul(t, t, den);
  pow(t, t, false);
  mul(t, t, num);
  mul(t, t, den);
  mul(t, t, den);
  mul(x, t, den);
  mul(chk, x, x);
  mul(chk, chk, den);
  if (!equal(chk, num)) {
    mul(x, x, I);
  }
  mul(chk, x, x);
  mul(chk, chk, den);
  if (!equal(chk, num)) {
    return;
  }
  if (parity(x) === floor(string.byte(s, 32) / 128)) {
    sub(x, gf(), x);
  }
  const xy = gf();
  mul(xy, x, y);
  return [x, y, copy(ONE), xy];
};

/** The 64 bytes of `h` mod L, as 32 numbers (bytes), the lowest first. */
const reduce = (h: string) => {
  const x: number[] = [...string.byte(h, 1, 64)];
  for (let i = 63; i >= 32; i--) {
    let c = 0;
    let j = i - 32;
    for (; j < i - 12; j++) {
      x[j] += c - 16 * x[i] * L[j - (i - 32)];
      c = floor((x[j] + 128) / 256);
      x[j] -= c * 256;
    }
    x[j] += c;
    x[i] = 0;
  }
  let c = 0;
  for (let j = 0; j < 32; j++) {
    x[j] += c - floor(x[31] / 16) * L[j];
    c = floor(x[j] / 256);
    x[j] -= c * 256;
  }
  for (let j = 0; j < 32; j++) {
    x[j] -= c * L[j];
  }
  for (let i = 0; i < 32; i++) {
    const high = floor(x[i] / 256);
    x[i + 1] += high;
    x[i] -= high * 256;
  }
  return x;
};

/** Bit `i` of the scalar `s` (bytes, the lowest first). */
const bit = (s: number[], i: number) => floor(s[floor(i / 8)] / 2 ** (i % 8)) % 2;

/**
 * Whether `signature` (64 bytes) is a valid Ed25519 signature of `message`
 * by the public key `publicKey` (32 bytes). All three are raw bytes; a
 * wrong length gives `false`.
 *
 * It takes a few milliseconds or more, the same for a message of any
 * length (only the SHA-512 of the message depends on its length).
 */
export const verify = (publicKey: string, message: string, signature: string): boolean => {
  if (publicKey.length !== 32 || signature.length !== 64) {
    return false;
  }
  const a = decodeNegative(publicKey);
  if (a === undefined) {
    return false;
  }
  const r = string.sub(signature, 1, 32);
  const s: number[] = [...string.byte(signature, 33, 64)];
  // S < L, else S + L would also be a valid signature
  for (let i = 31; i >= 0; i--) {
    if (s[i] < L[i]) {
      break;
    }
    if (s[i] > L[i] || i === 0) {
      return false;
    }
  }
  const h = sha512(r + publicKey + message);
  if (h === undefined) {
    return false;
  }
  const k = reduce(h);
  // [S]B - [k]A must be R
  const p: Point = [gf(), copy(ONE), copy(ONE), gf()];
  for (let i = 255; i >= 0; i--) {
    addPoint(p, p);
    if (bit(s, i) === 1) {
      addPoint(p, BASE);
    }
    if (bit(k, i) === 1) {
      addPoint(p, a);
    }
  }
  return encode(p) === r;
};

// SSH signatures (the SSHSIG format of OpenSSH)

const SSH_ED25519 = "ssh-ed25519";
const SSH_SK_ED25519 = "sk-ssh-ed25519@openssh.com";

const uint32 = (n: number) =>
  string.char(floor(n / 16777216) % 256, floor(n / 65536) % 256, floor(n / 256) % 256, n % 256);

/** `s` as a string of the SSH wire format: its length, and then `s`. */
const sshString = (s: string) => uint32(s.length) + s;

/** Reads the SSH wire format; each read gives `undefined` past the end. */
const reader = (data: string) => {
  let pos = 1;
  const take = (n: number) => {
    if (pos + n - 1 > data.length) {
      return undefined;
    }
    const value = string.sub(data, pos, pos + n - 1);
    pos += n;
    return value;
  };
  const number = () => {
    const bytes = take(4);
    if (bytes === undefined) {
      return undefined;
    }
    const [a, b, c, d] = string.byte(bytes, 1, 4);
    return ((a * 256 + b) * 256 + c) * 256 + d;
  };
  return {
    take,
    number,
    string: () => {
      const n = number();
      return n === undefined ? undefined : take(n);
    },
    done: () => pos > data.length,
  };
};

/**
 * Whether `signature` is a valid signature of `message` by `ssh-keygen -Y
 * sign` with the Ed25519 key `publicKey`, in the namespace `namespace`
 * (the `-n` of ssh-keygen, for example `file`).
 *
 * - `publicKey` is a line of a `.pub` file, for example
 *   `ssh-ed25519 AAAAC3Nz... comment`. A FIDO key (`sk-ssh-ed25519@openssh.com`,
 *   for example a YubiKey) is correct too.
 * - `signature` is the text of the `.sig` file, with its `BEGIN SSH SIGNATURE`
 *   and `END SSH SIGNATURE` lines.
 * - The signature must be by `publicKey`, with SHA-512 or SHA-256. A FIDO
 *   signature must also show that the user touched the key, the same as
 *   for `ssh-keygen -Y verify` without `no-touch-required`.
 * - Anything else gives `false`: also another type of key, a key line that
 *   is not correct, and an empty namespace (which the SSHSIG format does not
 *   permit).
 */
export const verifySsh = (publicKey: string, namespace: string, message: string, signature: string): boolean => {
  if (namespace === "") {
    return false;
  }
  const [type, text] = string.match(publicKey, "^%s*(%S+)%s+(%S+)");
  const blob = text === undefined ? undefined : decode(text);
  const key = reader(blob === undefined ? "" : blob);
  const keyType = key.string();
  const raw = key.string();
  const application = type === SSH_SK_ED25519 ? key.string() : "";
  if (
    blob === undefined ||
    (type !== SSH_ED25519 && type !== SSH_SK_ED25519) ||
    keyType !== type ||
    raw === undefined ||
    raw.length !== 32 ||
    application === undefined ||
    !key.done()
  ) {
    return false;
  }

  const [armored] = string.match(
    signature,
    "%-%-%-%-%-BEGIN SSH SIGNATURE%-%-%-%-%-(.-)%-%-%-%-%-END SSH SIGNATURE%-%-%-%-%-",
  );
  if (armored === undefined) {
    return false;
  }
  const data = decode(string.gsub(armored, "%s", "")[0]);
  if (data === undefined) {
    return false;
  }
  const sig = reader(data);
  if (sig.take(6) !== "SSHSIG" || sig.number() !== 1 || sig.string() !== blob || sig.string() !== namespace) {
    return false;
  }
  const reserved = sig.string();
  const algorithm = sig.string();
  const inner = sig.string();
  const hash = algorithm === "sha512" ? sha512 : algorithm === "sha256" ? sha256 : undefined;
  if (reserved === undefined || algorithm === undefined || inner === undefined || hash === undefined || !sig.done()) {
    return false;
  }
  const digest = hash(message);
  if (digest === undefined) {
    return false;
  }
  const signed = "SSHSIG" + sshString(namespace) + sshString(reserved) + sshString(algorithm) + sshString(digest);

  const parts = reader(inner);
  if (parts.string() !== type) {
    return false;
  }
  const bytes = parts.string();
  if (bytes === undefined) {
    return false;
  }
  if (type === SSH_ED25519) {
    return parts.done() && verify(raw, signed, bytes);
  }
  // a FIDO key signs the hash of its application, the flags, the counter
  // and the hash of the data
  const flags = parts.take(1);
  const counter = parts.take(4);
  if (flags === undefined || counter === undefined || !parts.done() || string.byte(flags) % 2 === 0) {
    return false;
  }
  const applicationHash = sha256(application);
  const signedHash = sha256(signed);
  if (applicationHash === undefined || signedHash === undefined) {
    return false;
  }
  return verify(raw, applicationHash + flags + counter + signedHash, bytes);
};

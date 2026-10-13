// Base64 (RFC 4648) for the strings of Lua, which are bytes.

/** The alphabet and the padding of a base64. */
export interface Options {
  /**
   * The 64 digits, in the order of their values. They must be 64 different
   * ASCII characters other than `=`; with another alphabet, the result is
   * not correct.
   */
  alphabet: string;
  /** Whether `encode` adds `=` to make the length a multiple of 4. */
  padding: boolean;
}

const STANDARD_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** The standard base64, with `+`, `/` and `=` padding. */
export const STANDARD: Readonly<Options> = { alphabet: STANDARD_ALPHABET, padding: true };
/** The standard base64, with `+` and `/`, without padding. */
export const STANDARD_NO_PAD: Readonly<Options> = { alphabet: STANDARD_ALPHABET, padding: false };
/** The base64 for URLs and file names, with `-`, `_` and `=` padding. */
export const URL: Readonly<Options> = { alphabet: URL_ALPHABET, padding: true };
/** The base64 for URLs and file names, with `-` and `_`, without padding. */
export const URL_NO_PAD: Readonly<Options> = { alphabet: URL_ALPHABET, padding: false };

/** The values of the digits of each alphabet that `decode` used, by their byte. */
const values = new LuaTable<string, LuaTable<number, number | undefined>>();

const valuesOf = (alphabet: string) => {
  let table = values.get(alphabet);
  if (table === undefined) {
    table = new LuaTable();
    for (let i = 0; i < 64; i++) {
      table.set(string.byte(alphabet, i + 1), i);
    }
    values.set(alphabet, table);
  }
  return table;
};

/** The bytes of `bytes` as base64, by default {@link STANDARD}. */
export const encode = (bytes: string, options: Readonly<Options> = STANDARD): string => {
  const { alphabet } = options;
  const digit = (value: number) => string.sub(alphabet, value + 1, value + 1);
  const pad = (3 - (bytes.length % 3)) % 3;
  const text = string.gsub(bytes + string.rep("\0", pad), "...", (group) => {
    const [a, b, c] = string.byte(group, 1, 3);
    const n = (a * 256 + b) * 256 + c;
    return digit(math.floor(n / 262144)) + digit(math.floor(n / 4096) % 64) + digit(math.floor(n / 64) % 64) + digit(n % 64);
  })[0];
  return string.sub(text, 1, text.length - pad) + (options.padding ? string.rep("=", pad) : "");
};

/**
 * The bytes of the base64 text `text`, with the alphabet of `options` (by
 * default {@link STANDARD}; its `padding` does not matter). Any number of
 * `=` at the end is ignored, so text with and without padding both decode.
 *
 * It is `undefined` when `text` has characters that are not in the alphabet
 * (white space too, and `=` before the end), or a number of digits that
 * cannot be whole bytes (4n + 1).
 */
export const decode = (text: string, options: Readonly<Options> = STANDARD): string | undefined => {
  const [digits] = string.match(text, "^(.-)=*$");
  if (digits === undefined || digits.length % 4 === 1) {
    return undefined;
  }
  const table = valuesOf(options.alphabet);
  const pad = (4 - (digits.length % 4)) % 4;
  let valid = true;
  const bytes = string.gsub(digits + string.rep(string.sub(options.alphabet, 1, 1), pad), "....", (group) => {
    const [a, b, c, d] = string.byte(group, 1, 4);
    const [va, vb, vc, vd] = [table.get(a), table.get(b), table.get(c), table.get(d)];
    if (va === undefined || vb === undefined || vc === undefined || vd === undefined) {
      valid = false;
      return "";
    }
    const n = ((va * 64 + vb) * 64 + vc) * 64 + vd;
    return string.char(math.floor(n / 65536), math.floor(n / 256) % 256, n % 256);
  })[0];
  return valid ? string.sub(bytes, 1, bytes.length - pad) : undefined;
};

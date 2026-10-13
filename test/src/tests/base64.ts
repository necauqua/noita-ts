import { decode, encode, STANDARD, STANDARD_NO_PAD, URL, URL_NO_PAD } from "@noita-ts/base/base64";
import { assert, assertEq, test } from "@noita-ts/base/test";

/// The base64 of @noita-ts/base/base64.

/** Bytes and their standard base64: RFC 4648, section 10, and `+` and `/`. */
const CASES: [string, string][] = [
  ["", ""],
  ["f", "Zg=="],
  ["fo", "Zm8="],
  ["foo", "Zm9v"],
  ["foob", "Zm9vYg=="],
  ["fooba", "Zm9vYmE="],
  ["foobar", "Zm9vYmFy"],
  [string.char(0xfb, 0xff, 0xbf), "+/+/"],
  [string.char(0xfb, 0xff), "+/8="],
  [string.char(0, 0, 0), "AAAA"],
];

const ALL = string.char(...Array.from({ length: 256 }, (_, i) => i));

test("base64 goes both ways", () => {
  for (const [bytes, text] of CASES) {
    assertEq(encode(bytes), text, `encode of "${bytes}"`);
    assertEq(decode(text), bytes, `decode of "${text}"`);
  }
  assertEq(decode(encode(ALL)), ALL, "all the bytes");
});

test("base64 has the URL alphabet and no padding as options", () => {
  for (const [bytes, text] of CASES) {
    const unpadded = string.gsub(text, "=", "")[0];
    const url = string.gsub(string.gsub(text, "%+", "-")[0], "/", "_")[0];
    const urlUnpadded = string.gsub(url, "=", "")[0];
    assertEq(encode(bytes, STANDARD), text, `STANDARD of "${bytes}"`);
    assertEq(encode(bytes, STANDARD_NO_PAD), unpadded, `STANDARD_NO_PAD of "${bytes}"`);
    assertEq(encode(bytes, URL), url, `URL of "${bytes}"`);
    assertEq(encode(bytes, URL_NO_PAD), urlUnpadded, `URL_NO_PAD of "${bytes}"`);
    assertEq(decode(url, URL), bytes, `decode of "${url}" with URL`);
    assertEq(decode(urlUnpadded, URL_NO_PAD), bytes, `decode of "${urlUnpadded}" with URL_NO_PAD`);
  }
  assertEq(decode(encode(ALL, URL_NO_PAD), URL), ALL, "all the bytes with URL");
  assertEq(decode("+/+/", URL), undefined, "+ and / with URL");
  assertEq(decode("-_-_"), undefined, "- and _ with STANDARD");
});

test("base64 decodes with any padding", () => {
  for (const text of ["Zg", "Zg=", "Zg==", "Zg===", "Zg======"]) {
    assertEq(decode(text), "f", `decode of "${text}"`);
  }
  assertEq(decode("Zm9v="), "foo", "padding that is not needed");
  assertEq(decode("===="), "", "only padding");
});

test("base64 that is not correct gives undefined", () => {
  for (const bad of ["Z", "Z===", "Zm9vY", "Zm9v\n", "Zm!v", "=Zg=", "Zg==Zg==", "Zm9v Zg==", "Zg=a"]) {
    assert(decode(bad) === undefined, `decode took "${bad}"`);
  }
});

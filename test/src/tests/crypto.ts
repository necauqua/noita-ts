import { assert, assertEq, test } from "@noita-ts/base/test";
import ffi from "@noita-ts/ffi";
import {
  fromHex,
  type HashAlgorithm,
  Hasher,
  md5,
  randomBytes,
  sha1,
  sha256,
  sha384,
  sha512,
  toHex,
} from "@noita-ts/crypto";

/// The hashes, HMAC and random bytes of @noita-ts/crypto (CNG).

interface Suite {
  name: string;
  algorithm: HashAlgorithm;
  hash: (this: void, data: string, key?: string) => string | undefined;
  /** The hashes of {@link MESSAGES}, in hex. */
  hashes: string[];
  /** The HMAC of {@link HMACS}, in hex. */
  hmacs: string[];
}

const MESSAGES = [
  "",
  "abc",
  "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
  string.rep("a", 1000000),
  // bytes above 0x7f in a string literal would become UTF-8
  string.char(0, 0xff, 0),
];

/** Key and data: RFC 4231 test cases 1, 2 and 6, an empty key, zero bytes. */
const HMACS: [string, string][] = [
  [string.rep("\x0b", 20), "Hi There"],
  ["Jefe", "what do ya want for nothing?"],
  [string.rep(string.char(0xaa), 131), "Test Using Larger Than Block-Size Key - Hash Key First"],
  ["", ""],
  ["k\0ey", "\0"],
];

const SUITES: Suite[] = [
  {
    name: "MD5",
    algorithm: "md5",
    hash: md5,
    hashes: [
      "d41d8cd98f00b204e9800998ecf8427e",
      "900150983cd24fb0d6963f7d28e17f72",
      "8215ef0796a20bcaaae116d3876c664a",
      "7707d6ae4e027c70eea2a935c2296f21",
      "b2b237a1bbd9c57b93b952c24e7936a8",
    ],
    hmacs: [
      "5ccec34ea9656392457fa1ac27f08fbc",
      "750c783e6ab0b503eaa86e310a5db738",
      "bfecaf4efff90a3a668f3922fec3762d",
      "74e6f7298a9c2d168935f58c001bad88",
      "563b2edc2cbba5c43705dc13bd705037",
    ],
  },
  {
    name: "SHA-1",
    algorithm: "sha1",
    hash: sha1,
    hashes: [
      "da39a3ee5e6b4b0d3255bfef95601890afd80709",
      "a9993e364706816aba3e25717850c26c9cd0d89d",
      "84983e441c3bd26ebaae4aa1f95129e5e54670f1",
      "34aa973cd4c4daa4f61eeb2bdbad27316534016f",
      "35a7ea9b5563f39b3283cded62110b88f0bbbb05",
    ],
    hmacs: [
      "b617318655057264e28bc0b6fb378c8ef146be00",
      "effcdf6ae5eb2fa2d27416d5f184df9c259a7c79",
      "90d0dace1c1bdc957339307803160335bde6df2b",
      "fbdb1d1b18aa6c08324b7d64b71fb76370690e1d",
      "96ba6403dd5a2724c8bcd206ca7661ee4ba816bf",
    ],
  },
  {
    name: "SHA-256",
    algorithm: "sha256",
    hash: sha256,
    hashes: [
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
      "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0",
      "2c8d07cd986f58eb210bd800133d6645c7340c59865377c8ea431cebca0b3113",
    ],
    hmacs: [
      "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7",
      "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843",
      "60e431591ee0b67f0d8a26aacbf5b77f8e0bc6213728c5140546040f0ee37f54",
      "b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad",
      "7e7aa3c27b3636c377c37cf03e83bcbb789b9e8c9743a7eda9910e7855520fe3",
    ],
  },
  {
    name: "SHA-384",
    algorithm: "sha384",
    hash: sha384,
    hashes: [
      "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b",
      "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7",
      "3391fdddfc8dc7393707a65b1b4709397cf8b1d162af05abfe8f450de5f36bc6b0455a8520bc4e6f5fe95b1fe3c8452b",
      "9d0e1809716474cb086e834e310a4a1ced149e9c00f248527972cec5704c2a5b07b8b3dc38ecc4ebae97ddd87f3d8985",
      "f5ed59f230d8a200941cacb3ae80f64c73992bb71ac9e80c15496210a2880778ea90a4feeec4d1d1ea24e3756f209996",
    ],
    hmacs: [
      "afd03944d84895626b0825f4ab46907f15f9dadbe4101ec682aa034c7cebc59cfaea9ea9076ede7f4af152e8b2fa9cb6",
      "af45d2e376484031617f78d2b58a6b1b9c7ef464f5a01b47e42ec3736322445e8e2240ca5e69e2c78b3239ecfab21649",
      "4ece084485813e9088d2c63a041bc5b44f9ef1012a2b588f3cd11f05033ac4c60c2ef6ab4030fe8296248df163f44952",
      "6c1f2ee938fad2e24bd91298474382ca218c75db3d83e114b3d4367776d14d3551289e75e8209cd4b792302840234adc",
      "76c2ce8d8975631790e02a0693ea54ea58453ca243e984dbb92b8ee5be4b515788471de5cd11bb22064e6f0c1c2e07cf",
    ],
  },
  {
    name: "SHA-512",
    algorithm: "sha512",
    hash: sha512,
    hashes: [
      "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
      "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
      "204a8fc6dda82f0a0ced7beb8e08a41657c16ef468b228a8279be331a703c33596fd15c13b1b07f9aa1d3bea57789ca031ad85c7a71dd70354ec631238ca3445",
      "e718483d0ce769644e2e42c7bc15b4638e1f98b13b2044285632a803afa973ebde0ff244877ea60a4cb0432ce577c31beb009c5c2c49aa2e4eadb217ad8cc09b",
      "d232462df2487c4a14e64eec5461316670f878a204e30503bdef76e901b065fddb58814ca7091092e42fb28dd969684b42f904d6207fd3bae6c83fdefc9004c9",
    ],
    hmacs: [
      "87aa7cdea5ef619d4ff0b4241a1d6cb02379f4e2ce4ec2787ad0b30545e17cdedaa833b7d6b8a702038b274eaea3f4e4be9d914eeb61f1702e696c203a126854",
      "164b7a7bfcf819e2e395fbe73b56e0a387bd64222e831fd610270cd7ea2505549758bf75c05a994a6d034f65f8f0e6fdcaeab1a34d4a6b4b636e070a38bce737",
      "80b24263c7c1a3ebb71493c1dd7be8b49b46d1f41b4aeec1121b013783f8f3526b56d037e05f2598bd0fd2215d6a1e5295e64f73f63f0aec8b915a985d786598",
      "b936cee86c9f87aa5d3c6f2e84cb5a4239a5fe50480a6ec66b70ab5b1f4ac6730c6c515421b327ec1d69402e53dfb49ad7381eb067b338fd7b0cb22247225d47",
      "d13e5fa6b32eafd168809c2381b039e908d612440e736bfddc016867f4502d604a197b2ca2c71e772615918457a595af52054a3df380ccbdffb25079515c3f15",
    ],
  },
];

/** `data` in parts of 1, 2, 3, ... bytes. */
const parts = (data: string) => {
  const result: string[] = [];
  let start = 1;
  for (let n = 1; start <= data.length; n++) {
    result.push(string.sub(data, start, start + n - 1));
    start += n;
  }
  return result;
};

for (const suite of SUITES) {
  test(`${suite.name} gives the known hashes`, () => {
    MESSAGES.forEach((message, i) => {
      assertEq(toHex(suite.hash(message)!), suite.hashes[i], `the hash of message ${i + 1}`);
    });
  });

  test(`${suite.name} in parts gives the same hashes`, () => {
    MESSAGES.forEach((message, i) => {
      const hasher = new Hasher(suite.algorithm);
      // the long message in parts of 1000 bytes, the others byte by byte
      if (message.length > 1000) {
        const part = string.sub(message, 1, 1000);
        for (let n = 0; n < message.length / 1000; n++) {
          hasher.update(part);
        }
      } else {
        for (const part of parts(message)) {
          hasher.update(part);
        }
      }
      assertEq(toHex(hasher.digest()!), suite.hashes[i], `the hash of message ${i + 1}`);
    });
  });

  test(`HMAC-${suite.name} gives the known values`, () => {
    HMACS.forEach(([key, data], i) => {
      assertEq(toHex(suite.hash(data, key)!), suite.hmacs[i], `the HMAC of case ${i + 1}`);
      const hasher = new Hasher(suite.algorithm, key);
      for (const part of parts(data)) {
        hasher.update(part);
      }
      assertEq(toHex(hasher.digest()!), suite.hmacs[i], `the HMAC in parts of case ${i + 1}`);
    });
  });
}

test("a hasher gives its hash once", () => {
  const hasher = new Hasher("sha256").update("abc");
  assertEq(toHex(hasher.digest()!), SUITES[2]!.hashes[1], "the first digest");
  assertEq(hasher.update("abc"), hasher, "update after the digest");
  assertEq(hasher.digest(), undefined, "a second digest");
});

test("hashers that are not finished are collected", () => {
  // each one has a CNG handle, which its finalizer destroys
  for (let i = 0; i < 1000; i++) {
    new Hasher("sha512").update("abc");
  }
  collectgarbage();
  collectgarbage();
  assertEq(toHex(sha512("abc")!), SUITES[4]!.hashes[1], "the hash after the collection");
});

test("an unknown hash algorithm gives no hash", () => {
  assertEq(new Hasher("md4" as HashAlgorithm).update("abc").digest(), undefined, "the hash of md4");
});

test("the providers are in the process-wide store", () => {
  sha384("abc");
  sha384("abc", "key");
  for (const name of ["crypto.provider.SHA384", "crypto.provider.HMAC-SHA384"]) {
    const address = ffi.store.get(name);
    assert(address !== undefined && tonumber(address)! > 0, `no ${name} in the store`);
  }
  assert(
    ffi.store.get("crypto.provider.SHA384") !== ffi.store.get("crypto.provider.HMAC-SHA384"),
    "the hash and the HMAC have the same provider",
  );
});

test("hex goes both ways", () => {
  const bytes = string.char(0, 1, 0x7f, 0x80, 0xab, 0xff);
  assertEq(toHex(bytes), "00017f80abff", "toHex");
  assertEq(fromHex("00017f80abff"), bytes, "fromHex");
  assertEq(fromHex("00017F80ABFF"), bytes, "fromHex of upper case");
  assertEq(toHex(""), "", "toHex of nothing");
  assertEq(fromHex(""), "", "fromHex of nothing");
  for (const bad of ["0", "abc", "0g", "00 ", "-1"]) {
    assertEq(fromHex(bad), undefined, `fromHex of "${bad}"`);
  }
});

test("random bytes have the given length and differ", () => {
  assertEq(randomBytes(0), "", "zero bytes");
  const a = randomBytes(32);
  const b = randomBytes(32);
  assertEq(a!.length, 32, "the length");
  assert(a !== b, "two calls gave the same bytes");
  assertEq(randomBytes(100000)!.length, 100000, "the length of many bytes");
  for (const bad of [-1, 1.5]) {
    assertEq(randomBytes(bad), undefined, `randomBytes of ${bad}`);
  }
});

import { fromHex } from "@noita-ts/crypto";
import { verify, verifySsh } from "@noita-ts/crypto/ed25519";
import { assert, assertEq, test } from "@noita-ts/base/test";

/// Ed25519 verification and SSH signatures of @noita-ts/crypto/ed25519.

interface Vector {
  name: string;
  publicKey: string;
  message: string;
  signature: string;
}

/** RFC 8032, section 7.1, in hex. */
const RFC: Vector[] = [
  {
    name: "TEST 1",
    publicKey: "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a",
    message: "",
    signature:
      "e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e06522490155" +
      "5fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b",
  },
  {
    name: "TEST 2",
    publicKey: "3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c",
    message: "72",
    signature:
      "92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da" +
      "085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00",
  },
  {
    name: "TEST 3",
    publicKey: "fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025",
    message: "af82",
    signature:
      "6291d657deec24024827e69c3abe01a30ce548a284743a445e3680d7db5ac3ac" +
      "18ff9b538d16f290ae67f760984dc6594a7c15e9716ed28dc027beceea1ec40a",
  },
  {
    name: "TEST 1024",
    publicKey: "278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e",
    message:
      "08b8b2b733424243760fe426a4b54908632110a66c2f6591eabd3345e3e4eb98" +
      "fa6e264bf09efe12ee50f8f54e9f77b1e355f6c50544e23fb1433ddf73be84d8" +
      "79de7c0046dc4996d9e773f4bc9efe5738829adb26c81b37c93a1b270b20329d" +
      "658675fc6ea534e0810a4432826bf58c941efb65d57a338bbd2e26640f89ffbc" +
      "1a858efcb8550ee3a5e1998bd177e93a7363c344fe6b199ee5d02e82d522c4fe" +
      "ba15452f80288a821a579116ec6dad2b3b310da903401aa62100ab5d1a36553e" +
      "06203b33890cc9b832f79ef80560ccb9a39ce767967ed628c6ad573cb116dbef" +
      "efd75499da96bd68a8a97b928a8bbc103b6621fcde2beca1231d206be6cd9ec7" +
      "aff6f6c94fcd7204ed3455c68c83f4a41da4af2b74ef5c53f1d8ac70bdcb7ed1" +
      "85ce81bd84359d44254d95629e9855a94a7c1958d1f8ada5d0532ed8a5aa3fb2" +
      "d17ba70eb6248e594e1a2297acbbb39d502f1a8c6eb6f1ce22b3de1a1f40cc24" +
      "554119a831a9aad6079cad88425de6bde1a9187ebb6092cf67bf2b13fd65f270" +
      "88d78b7e883c8759d2c4f5c65adb7553878ad575f9fad878e80a0c9ba63bcbcc" +
      "2732e69485bbc9c90bfbd62481d9089beccf80cfe2df16a2cf65bd92dd597b07" +
      "07e0917af48bbb75fed413d238f5555a7a569d80c3414a8d0859dc65a46128ba" +
      "b27af87a71314f318c782b23ebfe808b82b0ce26401d2e22f04d83d1255dc51a" +
      "ddd3b75a2b1ae0784504df543af8969be3ea7082ff7fc9888c144da2af58429e" +
      "c96031dbcad3dad9af0dcbaaaf268cb8fcffead94f3c7ca495e056a9b47acdb7" +
      "51fb73e666c6c655ade8297297d07ad1ba5e43f1bca32301651339e22904cc8c" +
      "42f58c30c04aafdb038dda0847dd988dcda6f3bfd15c4b4c4525004aa06eeff8" +
      "ca61783aacec57fb3d1f92b0fe2fd1a85f6724517b65e614ad6808d6f6ee34df" +
      "f7310fdc82aebfd904b01e1dc54b2927094b2db68d6f903b68401adebf5a7e08" +
      "d78ff4ef5d63653a65040cf9bfd4aca7984a74d37145986780fc0b16ac451649" +
      "de6188a7dbdf191f64b5fc5e2ab47b57f7f7276cd419c17a3ca8e1b939ae49e4" +
      "88acba6b965610b5480109c8b17b80e1b7b750dfc7598d5d5011fd2dcc5600a3" +
      "2ef5b52a1ecc820e308aa342721aac0943bf6686b64b2579376504ccc493d97e" +
      "6aed3fb0f9cd71a43dd497f01f17c0e2cb3797aa2a2f256656168e6c496afc5f" +
      "b93246f6b1116398a346f1a641f3b041e989f7914f90cc2c7fff357876e506b5" +
      "0d334ba77c225bc307ba537152f3f1610e4eafe595f6d9d90d11faa933a15ef1" +
      "369546868a7f3a45a96768d40fd9d03412c091c6315cf4fde7cb68606937380d" +
      "b2eaaa707b4c4185c32eddcdd306705e4dc1ffc872eeee475a64dfac86aba41c" +
      "0618983f8741c5ef68d3a101e8a3b8cac60c905c15fc910840b94c00a0b9d0",
    signature:
      "0aab4c900501b3e24d7cdf4663326a3a87df5e4843b2cbdb67cbf6e460fec350" +
      "aa5371b1508f9f4528ecea23c436d94b5e8fcd4f681e30a6ac00a9704a188a03",
  },
  {
    name: "TEST SHA(abc)",
    publicKey: "ec172b93ad5e563bf4932c70e1245034c35467ef2efd4d64ebf819683467e2bf",
    message:
      "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a" +
      "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
    signature:
      "dc2a4459e7369633a52b1bf277839a00201009a3efbf3ecb69bea2186c26b589" +
      "09351fc9ac90b3ecfdfbc7c66431e0303dca179c138ac17ad9bef1177331a704",
  },
];

/** The signature of TEST 1, with L added to S. */
const SIGNATURE_PLUS_L =
  "e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e06522490155" +
  "4c8c7872aa064e049dbb3013fbf29380d25bf5f0595bbe24655141438e7a101b";

/** y = 2 encodes no point of the curve. */
const NOT_A_POINT = "02" + string.rep("00", 31);

const MESSAGE = "hello from noita-ts\n";

/** Made with `ssh-keygen -t ed25519`. */
const PLAIN_KEY = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKXpqId3ukgOoz9a0x61DKNls13QJU+KwT4aKgXkVZJ3 noita-ts-plain";

/** `ssh-keygen -Y sign -n file` of {@link MESSAGE}, with SHA-512. */
const PLAIN_SHA512 = `-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgpemoh3e6SA6jP1rTHrUMo2WzXd
AlT4rBPhoqBeRVkncAAAAEZmlsZQAAAAAAAAAGc2hhNTEyAAAAUwAAAAtzc2gtZWQyNTUx
OQAAAEA6jyPLJqOCWSrhVaHHWAvaHlFtT64dlJv4xorzbPTMfzXHW9n0Pp5AQRJYGxKJa1
xH4dQi+O93yZtQ7vIOCb8G
-----END SSH SIGNATURE-----
`;

/** The same with `-O hashalg=sha256`. */
const PLAIN_SHA256 = `-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgpemoh3e6SA6jP1rTHrUMo2WzXd
AlT4rBPhoqBeRVkncAAAAEZmlsZQAAAAAAAAAGc2hhMjU2AAAAUwAAAAtzc2gtZWQyNTUx
OQAAAEAiYtKpLP9GPffZCMNQ6oluVBIsjYUPe9yE6rLYxE6c69fS5C5Y46Ne+RAVfDFEAx
8XewrzIwAJutfBjaPRAeQG
-----END SSH SIGNATURE-----
`;

/** A FIDO key on a YubiKey: `ssh-keygen -t ed25519-sk`. */
const SK_KEY =
  "sk-ssh-ed25519@openssh.com AAAAGnNrLXNzaC1lZDI1NTE5QG9wZW5zc2guY29tAAAAIG6ZgZ7BEembwRwG/tDkdwV64I9d4DryLN51ZbQ/BBwfAAAABHNzaDo= noita-ts-test";

/** `ssh-keygen -Y sign -n file` of {@link MESSAGE} with {@link SK_KEY}. */
const SK_SIGNATURE = `-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAAEoAAAAac2stc3NoLWVkMjU1MTlAb3BlbnNzaC5jb20AAAAgbpmBns
ER6ZvBHAb+0OR3BXrgj13gOvIs3nVltD8EHB8AAAAEc3NoOgAAAARmaWxlAAAAAAAAAAZz
aGE1MTIAAABnAAAAGnNrLXNzaC1lZDI1NTE5QG9wZW5zc2guY29tAAAAQMKcncoaT5m6Rn
wjyaNC0KgbzJqOTfoFWKxRgqVzklvQy4Zq8DlILurmeuH+ljVnW8XxQAhuDujkKEuoq+Xy
Wg4BAAAABw==
-----END SSH SIGNATURE-----
`;

/** `s` with the lowest bit of byte `i` (from 1) changed. */
const flip = (s: string, i: number) => {
  const b = string.byte(s, i);
  return string.sub(s, 1, i - 1) + string.char(b % 2 === 0 ? b + 1 : b - 1) + string.sub(s, i + 1);
};

test("Ed25519 verifies the signatures of RFC 8032", () => {
  for (const v of RFC) {
    const [publicKey, message, signature] = [fromHex(v.publicKey)!, fromHex(v.message)!, fromHex(v.signature)!];
    assert(verify(publicKey, message, signature), `${v.name} was rejected`);
    assert(!verify(publicKey, message + "x", signature), `${v.name} with a longer message was taken`);
    assert(!verify(publicKey, message, flip(signature, 5)), `${v.name} with a changed R was taken`);
    assert(!verify(publicKey, message, flip(signature, 40)), `${v.name} with a changed S was taken`);
    assert(!verify(flip(publicKey, 3), message, signature), `${v.name} with another key was taken`);
  }
});

test("Ed25519 rejects bad input", () => {
  const v = RFC[0]!;
  const [publicKey, signature] = [fromHex(v.publicKey)!, fromHex(v.signature)!];
  assert(!verify(publicKey, "", fromHex(SIGNATURE_PLUS_L)!), "S + L was taken");
  assert(!verify(fromHex(NOT_A_POINT)!, "", signature), "a key that is not a point was taken");
  assert(!verify(string.sub(publicKey, 2), "", signature), "a short key was taken");
  assert(!verify(publicKey, "", signature + "\0"), "a long signature was taken");
});

test("SSH signatures of an Ed25519 key are verified", () => {
  assert(verifySsh(PLAIN_KEY, "file", MESSAGE, PLAIN_SHA512), "the SHA-512 signature was rejected");
  assert(verifySsh(PLAIN_KEY, "file", MESSAGE, PLAIN_SHA256), "the SHA-256 signature was rejected");
  assert(!verifySsh(PLAIN_KEY, "git", MESSAGE, PLAIN_SHA512), "another namespace was taken");
  assert(!verifySsh(PLAIN_KEY, "file", MESSAGE + "x", PLAIN_SHA512), "another message was taken");
  assert(!verifySsh(SK_KEY, "file", MESSAGE, PLAIN_SHA512), "another key was taken");
  assert(!verifySsh(PLAIN_KEY, "file", MESSAGE, "nothing"), "a text without a signature was taken");
  assert(
    !verifySsh(PLAIN_KEY, "file", MESSAGE, string.gsub(PLAIN_SHA512, "AAAA", "AAAB", 1)[0]),
    "a changed signature was taken",
  );
});

test("SSH signatures of a FIDO key are verified", () => {
  assert(verifySsh(SK_KEY, "file", MESSAGE, SK_SIGNATURE), "the signature was rejected");
  assert(!verifySsh(SK_KEY, "file", "hello", SK_SIGNATURE), "another message was taken");
  assert(!verifySsh(PLAIN_KEY, "file", MESSAGE, SK_SIGNATURE), "another key was taken");
});

test("a public key that is not an Ed25519 key of SSH is rejected", () => {
  for (const bad of ["", "ssh-ed25519", "ssh-rsa AAAAC3NzaC1lZDI1NTE5AAAAIA==", "ssh-ed25519 !!!!"]) {
    assertEq(verifySsh(bad, "file", MESSAGE, PLAIN_SHA512), false, `the key "${bad}"`);
  }
  assertEq(verifySsh(PLAIN_KEY + "\n", "file", MESSAGE, PLAIN_SHA512), true, "a key line with a newline");
});

test("an empty namespace is rejected", () => {
  assertEq(verifySsh(PLAIN_KEY, "", MESSAGE, PLAIN_SHA512), false, "an empty namespace");
});

import fs from "fs";
import path from "path";

/** One file of a WAK archive. */
export type WakEntry = {
  /** The path of the file, for example `data/scripts/gun/gun_actions.lua`. */
  name: string;
  /** Where the content of the file starts in the archive. */
  offset: number;
  /** The length of the content in bytes. */
  size: number;
};

/**
 * Reads the table of contents of a WAK archive, the format of `data.wak`.
 *
 * The archive is not compressed or encrypted. It starts with a 16-byte header
 * of little-endian 32-bit integers: zero, the number of files, the offset where
 * the file contents start (the length of the header and the table together),
 * and zero. The table follows, one entry per file: the offset of the content,
 * its size, the length of the name, and the name itself.
 */
export function readWakEntries(wak: Buffer): WakEntry[] {
  const fail = (what: string): never => {
    throw new Error(`not a valid WAK archive: ${what}`);
  };
  if (wak.length < 16) {
    fail("it is shorter than its header");
  }
  const count = wak.readUInt32LE(4);
  const contentStart = wak.readUInt32LE(8);
  if (contentStart > wak.length) {
    fail("the table of contents is longer than the archive");
  }

  const entries: WakEntry[] = [];
  let at = 16;
  for (let i = 0; i < count; i++) {
    if (at + 12 > contentStart) {
      fail(`entry ${i} is outside of the table of contents`);
    }
    const offset = wak.readUInt32LE(at);
    const size = wak.readUInt32LE(at + 4);
    const nameLength = wak.readUInt32LE(at + 8);
    at += 12;
    if (at + nameLength > contentStart) {
      fail(`the name of entry ${i} is outside of the table of contents`);
    }
    const name = wak.toString("utf-8", at, at + nameLength);
    at += nameLength;
    if (offset < contentStart || offset + size > wak.length) {
      fail(`the content of ${name} is outside of the archive`);
    }
    entries.push({ name, offset, size });
  }
  return entries;
}

/**
 * Writes every file of a WAK archive under `outputDir`, at the path the archive
 * gives it. Returns the number of files written.
 *
 * A file that is there already is removed before it is written, instead of
 * written over: the files of a local instance are hard links to the Noita
 * installation, which writing over would change too.
 */
export function unpackWak(wakPath: string, outputDir: string): number {
  const wak = fs.readFileSync(wakPath);
  const entries = readWakEntries(wak);
  const root = path.resolve(outputDir);

  for (const { name, offset, size } of entries) {
    const target = path.resolve(root, name);
    if (!target.startsWith(root + path.sep)) {
      throw new Error(`${name} in ${wakPath} points outside of ${root}`);
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.rmSync(target, { force: true });
    fs.writeFileSync(target, wak.subarray(offset, offset + size));
  }
  return entries.length;
}

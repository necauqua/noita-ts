import fs from "fs";
import { StringDecoder } from "string_decoder";
import { dim } from "./colors.js";

/** How often the log file is looked at for new content, in milliseconds. */
const POLL_INTERVAL = 100;

export type GameLog = {
  /** Prints what is left in the file and stops following it. */
  stop: () => Promise<void>;
};

/**
 * Prints every line the game writes into `file` as it appears there, so that
 * the game log shows up in the console next to the output of the game process
 * itself.
 *
 * The file is polled rather than watched: `fs.watch` reports nothing on a
 * Windows file that Proton writes through, and the log is small enough that a
 * stat every {@link POLL_INTERVAL} costs nothing.
 */
export function followGameLog(file: string): GameLog {
  let position = 0;
  let inode = 0;
  let decoder = new StringDecoder("utf-8");
  let pending = "";
  let timer: NodeJS.Timeout | undefined;
  let stopped = false;

  // the game writes CRLF, and a lone CR at the end of a line only makes the
  // terminal redraw it
  const print = (line: string) => console.log(dim(line.replace(/\s+$/, "")));

  const restart = () => {
    position = 0;
    inode = 0;
    decoder = new StringDecoder("utf-8");
    pending = "";
  };

  /** Prints every complete line the file has grown by since the last call. */
  const drain = async () => {
    let stats;
    try {
      stats = await fs.promises.stat(file);
    } catch {
      // the game has not created it yet, or has taken it away again
      restart();
      return;
    }
    // the game empties the log when it starts, so everything in it is new; a
    // file that shrank was emptied, and one with another inode was replaced
    if (stats.size < position || (inode !== 0 && stats.ino !== inode)) {
      restart();
    }
    inode = stats.ino;
    if (stats.size === position) {
      return;
    }
    const handle = await fs.promises.open(file, "r");
    try {
      const buffer = Buffer.alloc(stats.size - position);
      const { bytesRead } = await handle.read(
        buffer,
        0,
        buffer.length,
        position,
      );
      position += bytesRead;
      // a decoder of its own, so that a multi-byte character split across two
      // reads still comes out as one character
      pending += decoder.write(buffer.subarray(0, bytesRead));
    } finally {
      await handle.close();
    }
    const lines = pending.split("\n");
    // the tail of a file being written to is usually half a line
    pending = lines.pop() ?? "";
    for (const line of lines) {
      print(line);
    }
  };

  // one read at a time, so that the last one and the poll it interrupts do not
  // both move the position
  let pump: Promise<void> = Promise.resolve();
  const queue = () => (pump = pump.then(drain).catch(() => {}));

  const tick = async () => {
    await queue();
    if (!stopped) {
      timer = setTimeout(tick, POLL_INTERVAL);
    }
  };
  void tick();

  return {
    async stop() {
      stopped = true;
      clearTimeout(timer);
      await queue();
      // whatever the game was in the middle of writing when it died has no
      // newline after it, and is usually the interesting part
      if (pending.trim() !== "") {
        print(pending);
      }
      pending = "";
    },
  };
}

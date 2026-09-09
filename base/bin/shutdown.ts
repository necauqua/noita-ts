import { spawnSync } from "child_process";
import fs from "fs";

/** What came of asking the game to quit. */
export type QuitRequest = {
  kind:
    | /** The game was asked, and is now saving and closing on its own. */
    "asked"
    | /** The game is running, but has no window to ask through yet. */
    "no-window"
    | /** The tool that asks is not installed. */
    "no-tool";
  /** What the tool complained about, when it did. */
  detail?: string;
};

/** The tool `askGameToQuit` needs on this platform. */
export const QUIT_TOOL = process.platform === "win32" ? "taskkill" : "xdotool";

/**
 * Asks the game to quit the way a user would, so that it writes its save and
 * closes by itself instead of being torn down mid-frame.
 *
 * `pid` is the process this launched - the game itself on Windows, and the
 * Proton wrapper elsewhere - and `dir` is the Noita instance it runs out of.
 */
export function askGameToQuit(pid: number, dir: string): QuitRequest {
  if (process.platform === "win32") {
    // without /F this is a WM_CLOSE to the windows of the process, which is
    // what alt+F4 comes down to, rather than a kill
    const res = spawnSync("taskkill", ["/PID", String(pid)], {
      encoding: "utf-8",
    });
    if (res.error) {
      return { kind: "no-tool" };
    }
    return res.status === 0
      ? { kind: "asked" }
      : { kind: "no-window", detail: (res.stderr ?? "").trim() || undefined };
  }

  const windows = findGameWindows(pid, dir);
  if (windows === undefined) {
    return { kind: "no-tool" };
  }
  if (windows.length === 0) {
    return { kind: "no-window", detail: complaint };
  }
  for (const window of windows) {
    spawnSync("xdotool", ["key", "--window", window, "alt+F4"], {
      stdio: "ignore",
    });
  }
  return { kind: "asked" };
}

/**
 * Kills the game and everything else this run started.
 *
 * The process group is taken as well as the processes themselves, so that a
 * child which has not been accounted for goes with them.
 */
export function killGameTree(pid: number, dir: string) {
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], {
      stdio: "ignore",
    });
    return;
  }

  const kill = (target: number) => {
    try {
      process.kill(target, "SIGKILL");
    } catch {
      // it was already gone
    }
  };

  // the processes have to be found before any of them dies, or the parents of
  // the ones further down are gone by the time they are looked for
  const found = gameProcesses(pid, dir).reverse();
  kill(-pid);
  // deepest first, so that nothing gets a chance to restart a child of its own
  for (const target of found) {
    kill(target);
  }
}

/**
 * What xdotool last said on stderr, kept so that a search which finds nothing
 * because it cannot reach the display says so instead of looking like a game
 * without a window.
 */
let complaint: string | undefined;

const xdotool = (args: string[]) => {
  const res = spawnSync("xdotool", args, { encoding: "utf-8" });
  if (res.error) {
    return undefined;
  }
  complaint = (res.stderr ?? "").trim() || complaint;
  return (res.stdout ?? "").split("\n").filter(Boolean);
};

/**
 * The X windows of the game, or `undefined` when xdotool is not installed.
 *
 * They are looked up by the process that owns them, because nothing else about
 * them belongs to the game alone: the window class wine gives them says
 * nothing about Noita, and a search by title is happy to return an editor that
 * has the word in it.
 *
 * The visible windows are the answer whenever there are any - the game also
 * keeps an input window and an IME one around, which no keypress reaches. They
 * are the answer only when the game window is not on screen at all, as it is
 * when it sits minimised.
 */
function findGameWindows(pid: number, dir: string): string[] | undefined {
  const pids = gameProcesses(pid, dir);
  const search = (extra: string[]) => {
    const found: string[] = [];
    for (const owner of pids) {
      const windows = xdotool(["search", ...extra, "--pid", String(owner)]);
      if (windows === undefined) {
        return undefined;
      }
      found.push(...windows);
    }
    return found;
  };

  const visible = search(["--onlyvisible"]);
  if (visible === undefined || visible.length > 0) {
    return visible;
  }
  return search([]);
}

/**
 * Every process of this run that is still around, `pid` included.
 *
 * Lineage alone does not find them: Proton hands the game over to the session
 * manager, which leaves noita.exe a child of nothing this started, in a
 * process group of its own. What stays true of it is the directory it runs out
 * of, and that instance belongs to this run alone.
 */
function gameProcesses(pid: number, dir: string): number[] {
  const found = descendants(pid);
  for (const stray of runningIn(dir)) {
    if (!found.includes(stray)) {
      found.push(stray);
    }
  }
  return found;
}

/** `pid` and every process below it, as /proc knows them. */
function descendants(pid: number): number[] {
  const children = new Map<number, number[]>();
  for (const child of processes()) {
    let stat;
    try {
      stat = fs.readFileSync(`/proc/${child}/stat`, "ascii");
    } catch {
      // it ended between the listing and the read
      continue;
    }
    // the second field is the executable name in parentheses and may hold
    // anything, spaces and parentheses included, so the fields after it are
    // counted from the last closing one
    const rest = stat.slice(stat.lastIndexOf(")") + 1).trim().split(" ");
    const parent = Number(rest[1]);
    if (!parent) {
      continue;
    }
    children.set(parent, [...(children.get(parent) ?? []), child]);
  }
  const all = [pid];
  for (let i = 0; i < all.length; i++) {
    all.push(...(children.get(all[i]) ?? []));
  }
  return all;
}

/** Every process that runs out of `dir`, whoever started it. */
function runningIn(dir: string): number[] {
  const found: number[] = [];
  for (const pid of processes()) {
    if (pid === process.pid) {
      continue;
    }
    try {
      if (fs.readlinkSync(`/proc/${pid}/cwd`) === dir) {
        found.push(pid);
      }
    } catch {
      // it ended, or it belongs to somebody else
    }
  }
  return found;
}

/** Every pid /proc lists, which is nothing at all where there is no /proc. */
function processes(): number[] {
  try {
    return fs
      .readdirSync("/proc")
      .map(Number)
      .filter((pid) => !!pid);
  } catch {
    return [];
  }
}

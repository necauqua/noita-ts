import { spawn, spawnSync } from "child_process";
import { findNoita } from "./steam.js";

/** Every line of the report printed by `@noita-ts/base/test` starts with this. */
const PREFIX = "[nts-test]";

const colors = !!process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: string, text: string) =>
  colors ? `\x1b[${code}m${text}\x1b[0m` : text;
const green = (text: string) => paint("32", text);
const red = (text: string) => paint("31", text);
const dim = (text: string) => paint("2", text);

export type TestOptions = {
  /** Container image to run, see https://github.com/necauqua/noita-docker. */
  image: string;
  /** Container engine binary. */
  docker: string;
  /** Noita install to bind into the container, Steam is searched without it. */
  noita?: string;
  /** How long to wait for the report, in seconds. */
  timeout: number;
  /** World seed to run with, random without it. */
  seed?: string;
  /** Leave the container running afterwards, to poke at it. */
  keep?: boolean;
  /** Print the whole game log, not just the report. */
  gameLog?: boolean;
};

const run = (cmd: string, args: string[]) => {
  const res = spawnSync(cmd, args, { encoding: "utf-8" });
  if (res.error) {
    throw res.error;
  }
  return {
    status: res.status ?? -1,
    stdout: (res.stdout ?? "").trim(),
    stderr: (res.stderr ?? "").trim(),
  };
};

/**
 * Label every container started by this command carries, reverse-DNS as the
 * convention for label keys goes.
 */
const TEST_LABEL = "ua.necauq.noita-ts.test";

/**
 * Label carrying the pid of the run a container belongs to. Containers kept
 * with `--keep` are deliberately left without it, so that they are not reaped.
 */
const PID_LABEL = `${TEST_LABEL}.pid`;

/**
 * Removes the containers of `nts-test` runs whose process is gone, in case one
 * was left behind by a run that died before it could clean up after itself.
 */
const reapStale = (docker: string) => {
  const listed = run(docker, [
    "ps",
    "-a",
    "--filter",
    `label=${TEST_LABEL}`,
    "--filter",
    `label=${PID_LABEL}`,
    "--format",
    "{{.ID}}",
  ]);
  const ids = listed.stdout.split("\n").filter(Boolean);
  if (ids.length === 0) {
    return;
  }
  // one inspect for all of them, the label is not readable through the `ps`
  // format string on every container engine
  const inspected = run(docker, [
    "inspect",
    "-f",
    `{{.Name}} {{index .Config.Labels "${PID_LABEL}"}}`,
    ...ids,
  ]);
  for (const line of inspected.stdout.split("\n").filter(Boolean)) {
    const [name, pid] = line.trim().replace(/^\//, "").split(" ");
    if (!name || !pid || alive(Number(pid))) {
      continue;
    }
    run(docker, ["rm", "-f", name]);
  }
};

/** Whether a process with this pid exists, without signalling it. */
const alive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    // EPERM means it exists and just is not ours to signal
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
};

/**
 * Starts a detached process that removes the container once this one is gone.
 *
 * The in-process cleanup covers the ordinary exits, but `npx` kills the whole
 * process tree on Ctrl+C, which regularly takes this process down before, or
 * halfway through, its signal handler. The watchdog is outside of that tree
 * (detached, so it also does not get the terminal's SIGINT) and outlives it.
 *
 * It is another node rather than a shell one-liner, so that it works the same
 * on Windows, where there is no `sh` to poll with.
 */
const watchdog = (docker: string, container: string) => {
  const script = `
    const { spawnSync } = require("child_process");
    const gone = () => {
      try {
        process.kill(${process.pid}, 0);
        return false;
      } catch (e) {
        return e.code !== "EPERM";
      }
    };
    const tick = () => gone()
      ? spawnSync(process.argv[1], ["rm", "-f", process.argv[2]], { stdio: "ignore" })
      : setTimeout(tick, 1000);
    tick();
  `;
  const child = spawn(process.execPath, ["-e", script, docker, container], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
};

const die = (message: string): never => {
  console.error(`error: ${message}`);
  process.exit(1);
};

/**
 * Boots `mods` (a directory of mod directories) in a headless Noita container,
 * follows the log until the test report arrives and exits accordingly.
 */
export default async function runTests(mods: string, opts: TestOptions) {
  const { image, docker, timeout, seed, keep, gameLog } = opts;
  const container = `nts-test-${process.pid}`;

  let running = false;
  let stopped = false;
  const stop = () => {
    if (!running) {
      return;
    }
    if (keep || stopped) {
      if (keep && !stopped) {
        console.log(`Leaving ${container} running (--keep)`);
      }
      stopped = true;
      return;
    }
    stopped = true;
    // `stop` gives the game a moment to die on its own, `rm -f` makes sure
    // nothing is left behind when it does not or when `--rm` did not fire
    run(docker, ["stop", "-t", "1", container]);
    run(docker, ["rm", "-f", container]);
  };

  // the container name is known before it exists, and cleaning up a container
  // that was never started is a no-op, so the handlers can go up front - a
  // Ctrl+C landing between `docker run` and the handlers would otherwise leak
  const onSignal = (signal: NodeJS.Signals) => {
    console.log(`\nStopping ${container}`);
    stop();
    process.exit(128 + (signal === "SIGINT" ? 2 : 15));
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  process.once("SIGHUP", onSignal);
  // last resort for the paths that exit without going through the above, like
  // an unexpected throw somewhere in here
  process.once("exit", () => stop());

  reapStale(docker);

  if (run(docker, ["image", "inspect", image]).status !== 0) {
    die(
      `container image "${image}" not found - build it from the noita-docker ` +
        `repo (\`just build\`), or pass --image`,
    );
  }

  const noita = opts.noita ?? findNoita();

  // no /appdata mount: the save lives in the container layer and dies with it,
  // so every run starts from a clean world
  const started = run(docker, [
    "run",
    "--rm",
    "-d",
    "--name",
    container,
    "--label",
    `${TEST_LABEL}=1`,
    // the pid label is what the reaper of the next run goes by, and `--keep`
    // opts out of being reaped by not having it
    ...(keep ? [] : ["--label", `${PID_LABEL}=${process.pid}`]),
    "-v",
    `${noita}:/noita:ro`,
    "-v",
    `${mods}:/mods:ro`,
    ...(seed ? ["-e", `NOITA_WORLD_SEED=${seed}`] : []),
    image,
    "-gamemode",
    "0",
    "-no_logo_splashes",
  ]);
  if (started.status !== 0) {
    die(`could not start the container:\n${started.stderr}`);
  }
  running = true;
  if (!keep) {
    watchdog(docker, container);
  }
  console.log(`Running the tests in container ${container}\n`);

  const lines = await collectReport(
    docker,
    container,
    timeout * 1000,
    !!gameLog,
  ).catch(
    (e) => {
      stop();
      return die(e instanceof Error ? e.message : String(e));
    },
  );
  process.off("SIGINT", onSignal);
  process.off("SIGTERM", onSignal);
  process.off("SIGHUP", onSignal);
  stop();

  const failed = lines.filter((l) => l.startsWith("FAIL"));
  const done = lines.find((l) => l.startsWith("DONE"))?.slice(5) ?? "?";

  if (failed.length > 0) {
    console.error(`\n${failed.length} test(s) failed, ${done} passed`);
    process.exit(1);
  }
  console.log(`\nAll tests passed (${done})`);
}

/**
 * Follows the container log until the mod reports that it is done, returning
 * the report lines. Rejects when the game dies or the timeout runs out.
 */
function collectReport(
  docker: string,
  container: string,
  timeout: number,
  gameLog: boolean,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const logs = spawn(docker, ["logs", "-f", container]);
    const lines: string[] = [];
    let buffer = "";

    // the suite reports its size before running anything, so results can be
    // shown as progress and logs can line up under them
    let total = "?";
    let done = 0;
    const counter = () => dim(`[${++done}/${total}]`);
    const indent = () => " ".repeat(`[${done}/${total}] `.length);

    let finished = false;
    const finish = (fn: () => void) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timer);
      clearInterval(alive);
      logs.kill();
      fn();
    };

    const timer = setTimeout(
      () => finish(() => reject(new Error(`timed out after ${timeout}ms`))),
      timeout,
    );

    // the game can take the container down with it (an FFI read of a bad
    // pointer segfaults it), and then no report is ever coming
    const alive = setInterval(() => {
      const state = run(docker, [
        "inspect",
        "-f",
        "{{.State.Running}}",
        container,
      ]);
      if (state.stdout !== "true") {
        finish(() =>
          reject(new Error("the game died before finishing the tests")),
        );
      }
    }, 5000);

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString();
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const idx = part.indexOf(PREFIX);
        if (idx === -1) {
          if (gameLog) {
            console.log(dim(part.trimEnd()));
          }
          if (part.includes("Lua (DoFile) error")) {
            finish(() => reject(new Error(`the mod failed to load:\n${part}`)));
          }
          continue;
        }
        const line = part.slice(idx + PREFIX.length).trim();

        // logs are printed as they arrive, but say nothing about the outcome
        if (line.startsWith("LOG ")) {
          console.log(indent() + line.slice(4));
          continue;
        }
        if (line.startsWith("START ")) {
          total = line.slice(6);
          continue;
        }

        lines.push(line);

        if (line.startsWith("PASS ")) {
          console.log(`${counter()} ${green("PASS")} ${line.slice(5)}`);
        } else if (line.startsWith("FAIL ")) {
          console.log(`${counter()} ${red("FAIL")} ${line.slice(5)}`);
        } else if (line.startsWith("DONE")) {
          // the summary printed at the end says the same thing
          finish(() => resolve(lines));
        }
      }
    };

    logs.stdout.on("data", onData);
    logs.stderr.on("data", onData);
    logs.on("close", () =>
      finish(() => reject(new Error("the container log ended with no report"))),
    );
  });
}

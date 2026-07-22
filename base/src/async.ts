import mod from ".";

/**
 * A simple polling scheduler for running Lua coroutines with TSTL Promise
 * support.
 *
 * Based on `pollnet.Reactor`.
 *
 * Usage example:
 * ```typescript
 * const scheduler = new Scheduler();
 *
 * mod.on("WorldPreUpdate", () => scheduler.poll());
 * mod.on("PausePreUpdate", () => scheduler.poll());
 *
 * const sleep = (frames: number) => scheduler.spawn(() => {
 *    for (let i = 0; i < frames; i++) {
 *        coroutine.yield();
 *    }
 * });
 *
 * (async() => {
 *     await sleep(300);
 *     GamePrint("5 seconds passed")
 *     while (true) {
 *         await sleep(60);
 *         GamePrint("1 more second passed");
 *     }
 * })().catch(print_error);
 * ```
 *
 * Note that in real code you'd probably want to use `scheduler.wait()` instead
 * of writing your own `sleep` function - its just an example of converting a
 * coroutine into a promise.
 *
 * Also note that you can use `Scheduler.register()` to create a scheduler and register it to poll on every frame automatically.
 */
export default class Scheduler {
  private threads = new LuaTable<LuaThread, true>();

  /**
   * A shortcut for creating a scheduler and registering it to poll on every frame.
   *
   * Do *not* poll the scheduler manually if you use this method, it will
   * register itself to be polled on "WorldPreUpdate" and "PausePreUpdate"
   * events.
   */
  static register() {
    const scheduler = new Scheduler();
    mod.on("WorldPreUpdate", () => scheduler.poll());
    mod.on("PausePreUpdate", () => scheduler.poll());
    return scheduler;
  }

  /**
   * Resume all spawned threads once. This should be called every frame.
   *
   * Returns the number of threads that are still alive after polling.
   */
  poll() {
    const polled = this.threads;
    this.threads = new LuaTable<LuaThread, true>();

    const survivors = new LuaTable<LuaThread, true>();
    let alive = 0;

    for (const [thread] of pairs(polled)) {
      // our threads never fail because spawn catches errors and rejects the
      // promise, not surfacing the error to the coroutine;
      // and we should never have dead threads in the list either
      coroutine.resume(thread);

      // might have just finished
      if (coroutine.status(thread) !== "dead") {
        survivors.set(thread, true);
        alive++;
      }
    }

    // re-add any new threads spawned by polled threads
    for (const [thread] of pairs(this.threads)) {
      survivors.set(thread, true);
      alive++;
    }

    this.threads = survivors;
    return alive;
  }

  /**
   * Run `body` inside a new coroutine and get its completion as a Promise.
   * `body` may freely use coroutine.yield() / other yield-based APIs.
   * Errors inside body reject the promise.
   */
  spawn<T>(body: () => T) {
    return new Promise<T>((resolve, reject) => {
      const thread = coroutine.create(() => {
        try {
          resolve(body());
        } catch (e) {
          reject(e);
        }
      });
      // Start the coroutine immediately (unlike pollnet), so only explicit
      // yields delay execution (for example `await scheduler.tick()` takes two
      // polls without this)
      // (also see comment on resume call in poll about error handling)
      coroutine.resume(thread);
      // and if it had no yields don't even bother
      if (coroutine.status(thread) !== "dead") {
        this.threads.set(thread, true);
      }
    });
  }

  /**
   * Resumes after one tick.
   *
   * This is a convenience method that spawns a coroutine that just yields once.
   */
  tick() {
    return this.spawn(() => {
      coroutine.yield();
    });
  }

  /**
   * Resumes after a given number of ticks.
   *
   * This is a convenience method that spawns a coroutine that just yields
   * `ticks` times.
   */
  wait(ticks: number) {
    return this.spawn(() => {
      for (let i = 0; i < ticks; i++) {
        coroutine.yield();
      }
    });
  }

  /**
   * Yields the current coroutine until the promise settles, then returns its
   * value or rethrows its rejection.
   *
   * Only call this from a scheduled coroutine (`scheduler.spawn(() => { .. HERE .. })`).
   */
  yield<T>(p: Promise<T>) {
    let done = false;
    let ok = false;
    let result: unknown;
    p.then(
      (v) => {
        done = true;
        ok = true;
        result = v;
      },
      (e) => {
        done = true;
        ok = false;
        result = e;
      },
    );
    while (!done) {
      coroutine.yield();
    }
    if (!ok) {
      throw result;
    }
    return result as T;
  }
}

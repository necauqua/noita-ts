import mod from ".";

/**
 * A simple polling scheduler for running Lua coroutines with TSTL Promise
 * support.
 *
 * Based on `pollnet.Reactor`.
 *
 * Basic example:
 * ```typescript
 *
 * // On first call, Scheduler.get() creates and registers a scheduler to be
 * // polled on "WorldPreUpdate" and "PausePreUpdate" events, and stores itself.
 * const scheduler = Scheduler.get();
 *
 * (async() => {
 *     await scheduler.wait(300);
 *     GamePrint("5 seconds passed")
 *     while (true) {
 *         await scheduler.wait(60);
 *         GamePrint("1 more second passed");
 *     }
 * })().catch(print_error);
 * ```
 *
 * Manual example (no magic singletons):
 * ```typescript
 * const scheduler = new Scheduler();
 *
 * mod.on("WorldPreUpdate", () => scheduler.poll());
 * mod.on("PausePreUpdate", () => scheduler.poll());
 *
 * // Manually reimplement scheduler.wait here too
 * const sleep = (frames: number) => scheduler.spawn(() => {
 *    for (let i = 0; i < frames; i++) {
 *        // this can be any yield-based API, scheduler is a tool
 *        // for converting Lua coroutines into Promises and vice-versa
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
 */
export default class Scheduler {
  private threads = new LuaTable<LuaThread, true>();

  private static _instance: Scheduler | undefined;

  /**
    * A convenience lazy singleton storage for return of `Scheduler.register()`.
    *
    * This is the most convenient way to use the scheduler, applicable to 99% of use cases.
    *
    * Example, in any file run in the init context:
    * ```typescript
    * import Scheduler from "@noita-ts/base/async";
    *
    * const scheduler = Scheduler.get();
    *
    * scheduler.wait(60).then(() => GamePrint("60 frames later.."));
    * ```
    */
  static get() {
    return this._instance ??= Scheduler.register();
  }

  /**
    * A shortcut for creating a scheduler and registering it to poll on every
    * frame.
    *
    * Do *not* poll the scheduler manually if you use this method, it will
    * register itself to be polled on "WorldPreUpdate" and "PausePreUpdate"
    * events.
    * This means such a scheduler will be automatically polled in the init
    * context - for anything more exotic you can create and poll a scheduler
    * manually.
    *
    * Also while you technically can create multiple schedulers, it is highly
    * not recomended, so do not call this method more than once in your mod.
    * `Scheduler.get()` lazily creates and stores a singleton instance of the
    * scheduler, use that instead.
    *
    * Example:
    * ```typescript
    * import Scheduler from "@noita-ts/base/async";
    *
    * const scheduler = Scheduler.register();
    *
    * scheduler.wait(60).then(() => GamePrint("60 frames later.."));
    * ```
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

    for (const [thread] of Object.entries(polled)) {
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
    for (const [thread] of Object.entries(this.threads)) {
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
   * Resumes after one poll.
   *
   * This is a convenience method that spawns a coroutine that just yields once.
   */
  tick() {
    return this.spawn(() => {
      coroutine.yield();
    });
  }

  /**
   * Resumes after a given number of polls.
   *
   * This is a convenience method that spawns a coroutine that just yields
   * `polls` times.
   */
  wait(polls: number) {
    return this.spawn(() => {
      for (let i = 0; i < polls; i++) {
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

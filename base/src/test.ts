import mod from ".";

/**
 * A minimal in-game test runner, driven by `nts test`.
 *
 * Register cases from `src/test.ts` (or anything it imports) - that file is
 * left out of regular builds and only becomes the entry point of the mod for
 * `nts test`, which boots the mod in a headless Noita container and reads the
 * report back out of the game log:
 *
 * ```typescript
 * import { assert, assertEq, test } from "@noita-ts/base/test";
 *
 * test("the world is there", () => {
 *   assert(GameGetWorldStateEntity() != 0, "no world state entity");
 * });
 * ```
 *
 * Cases run concurrently as soon as the world is up, and may be async - a
 * failure (or any other error) fails just the one case. Awaiting anything
 * frame-based needs a scheduler polled by the mod, see `@noita-ts/base/async`.
 */

/** Every line the report is made of starts with this. */
const PREFIX = "[nts-test]";

/**
 * Prints a line into the report, which `nts test` shows as it arrives - the
 * way to dump values from a test while investigating something.
 */
export const log = (...values: unknown[]) =>
  print(`${PREFIX} LOG ${values.map((v) => tostring(v)).join(" ")}`);

type TestBody = (this: void) => void | Promise<void>;

const tests: { name: string; body: TestBody }[] = [];

/** Registers a test to be run once the world is up. */
export const test = (name: string, body: TestBody) => {
  tests.push({ name, body });
};

/** Fails the current test unless `condition` holds. */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    error(message, 2);
  }
}

/** Fails the current test unless the two values are equal. */
export const assertEq = (actual: unknown, expected: unknown, what: string) =>
  assert(
    actual === expected,
    `${what}: expected ${tostring(expected)}, got ${tostring(actual)}`,
  );

/** Awaiting the body turns a synchronous throw into a rejection too. */
const runTest = async (body: TestBody) => {
  await body();
};

/** Starts every registered test, printing the report as they settle. */
export const runTests = () => {
  const total = tests.length;
  let finished = 0;
  let passed = 0;

  const settled = (name: string, failure?: unknown) => {
    finished += 1;
    if (failure === undefined) {
      passed += 1;
      print(`${PREFIX} PASS ${name}`);
    } else {
      print(`${PREFIX} FAIL ${name}: ${tostring(failure)}`);
    }
    if (finished === total) {
      print(`${PREFIX} DONE ${passed}/${total}`);
    }
  };

  // the count comes first, so the report can be shown as progress
  print(`${PREFIX} START ${total}`);

  if (total === 0) {
    print(`${PREFIX} DONE 0/0`);
    return;
  }

  for (const { name, body } of tests) {
    runTest(body).then(
      () => settled(name),
      (e) => settled(name, e ?? "failed"),
    );
  }
};

let started = false;

// the world being up is what every test can rely on, so that is when they start
mod.on("WorldPreUpdate", () => {
  if (started) {
    return;
  }
  started = true;
  runTests();
});

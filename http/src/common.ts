// What the client and the server share.

/**
 * Anything that looks, walks and quacks like a scheduler (to not depend on
 * `@noita-ts/base` directly).
 * Import and set up a `Scheduler` from `@noita-ts/base/async` for this.
 */
export interface Scheduler {
  spawn<T>(body: () => T): Promise<T>;
}

/**
 * Headers as a map from the names to the values. An array value is the
 * header once for each of its values.
 */
export type HeaderMap = Record<string, string | string[]>;

/**
 * An error code of a Windows API (for example `WinINet`) for an error
 * message, with its name from `names` when it has one.
 */
export const describeError = (
  api: string,
  error: number,
  names?: Record<number, string>,
) => {
  const name = names?.[error];
  return name !== undefined
    ? `${api} error ${error} (${name})`
    : `${api} error ${error}`;
};

/**
 * The `Name: value` lines of `headers`, sorted by name. The names and the
 * values are not checked.
 */
export const headerLines = (headers: HeaderMap) => {
  const names = Object.keys(headers);
  names.sort();
  const lines: string[] = [];
  for (const name of names) {
    const value = headers[name]!;
    for (const v of typeof value === "string" ? [value] : value) {
      lines.push(`${name}: ${v}`);
    }
  }
  return lines;
};

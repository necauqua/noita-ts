// What the modules of the server share.

import type { HeaderMap } from "../common";

/** Prints an error of `what` (for example `server`) with the prefix of the package. */
export const printError = (what: string, error: unknown) =>
  print(`[@noita-ts/http] ${what}: ${error}`);

/**
 * The name that `headers` has for the header `name` (in any case), or
 * `undefined`.
 */
export const headerName = (headers: HeaderMap, name: string) => {
  const lower = name.toLowerCase();
  return Object.keys(headers).find((n) => n.toLowerCase() === lower);
};

/**
 * `headers` with the headers of `defaults` that it does not have (by their
 * names in any case).
 */
export const withDefaults = (
  headers: HeaderMap | undefined,
  defaults: HeaderMap,
): HeaderMap => {
  const result: HeaderMap = { ...headers };
  for (const [name, value] of Object.entries(defaults)) {
    if (headerName(result, name) === undefined) {
      result[name] = value;
    }
  }
  return result;
};

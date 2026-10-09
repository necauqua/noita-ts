// The text of the requests and the responses in HTTP/1.1: the head of a
// request, its body, and the bytes of a response.

import { type HeaderMap, headerLines } from "../common";
import type { ServerResponse } from "./message";
import { EventStream } from "./stream";

/** Decodes the `%XX` escapes in a part of a URL, and `+` as a space. */
const decodeQuery = (text: string) =>
  string.gsub(string.gsub(text, "%+", " ")[0], "%%(%x%x)", (hex: string) =>
    string.char(tonumber(hex, 16)!),
  )[0];

/**
 * `text` without the whitespace at its start and at its end, in linear time
 * (on a long run of whitespace, `^%s*(.-)%s*$` takes quadratic time, and
 * `^%s*(.*%S)` too when there is no `%S`).
 */
const trim = (text: string) =>
  string.find(text, "%S")[0] !== undefined
    ? string.match(text, "^%s*(.*%S)")[0]!
    : "";

const REASONS: Record<number, string> = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  413: "Content Too Large",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  500: "Internal Server Error",
  501: "Not Implemented",
  503: "Service Unavailable",
};

/**
 * The request line and the headers in `head`, and the minor version of HTTP
 * (`0` or `1` for HTTP/1.0 or HTTP/1.1), or `undefined` if invalid.
 */
export const parseHead = (head: string) => {
  // a bare LF ends a line too, and a bare CR makes the request invalid (RFC
  // 9112, section 2.2)
  const text = string.gsub(head, "\r\n", "\n")[0];
  if (string.find(text, "\r", 1, true)[0] !== undefined) {
    return undefined;
  }
  const lines = text.split("\n");
  const [method, target, minor] = string.match(
    lines[0]!,
    "^(%u+) (/%S*) HTTP/1%.(%d)$",
  );
  if (method === undefined || target === undefined || minor === undefined) {
    return undefined;
  }
  const headers: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const [name, rest] = string.match(line, "^([^:%s]+):(.*)$");
    if (name === undefined || rest === undefined) {
      return undefined;
    }
    const value = trim(rest);
    const key = name.toLowerCase();
    const previous = headers[key];
    // more than one `Host` is invalid (RFC 9112, section 3.2)
    if (key === "host" && previous !== undefined) {
      return undefined;
    }
    headers[key] =
      previous === undefined
        ? value
        : `${previous}${key === "cookie" ? "; " : ", "}${value}`;
  }
  const [path, rawQuery] = string.match(target, "^([^?#]*)%??([^#]*)");
  const query: Record<string, string> = {};
  for (const [part] of string.gmatch(rawQuery ?? "", "[^&]+")) {
    // the key ends at the first `=`; a part without a key has no parameter
    const [key, value] = string.match(part, "^([^=]+)=?(.*)$");
    if (key !== undefined && value !== undefined) {
      query[decodeQuery(key)] = decodeQuery(value);
    }
  }
  // the target starts with `/`, so the path is never empty
  return {
    method,
    target,
    path: path!,
    query,
    headers,
    minor: tonumber(minor)!,
  };
};

// the body of a request: its length by `Content-Length`, and the decoding
// of a chunked body (RFC 9112, section 7.1)

/** An error of a chunked body: the status of the response and its text. */
type BodyError = [status: number, text: string];

const INVALID_CHUNKED: BodyError = [400, "an invalid chunked body"];
const EXTENSIONS_TOO_LARGE: BodyError = [
  413,
  "the chunk extensions are too large",
];
const TRAILERS_TOO_LARGE: BodyError = [
  431,
  "the trailer fields are too large",
];

/**
 * The bytes of a request after its head, which come from `read` when they
 * are necessary. `read` gives the next bytes from the client, or `undefined`
 * when the connection is over.
 */
export class BodyReader {
  /** The bytes that came and are not taken yet start at `pos`. */
  private pos = 1;

  constructor(
    private data: string,
    private read: (this: void) => string | undefined,
  ) {}

  /** Whether no bytes wait to be taken. */
  isEmpty() {
    return this.pos > this.data.length;
  }

  /** Reads more bytes; false when the connection is over. */
  private fill() {
    const more = this.read();
    if (more === undefined) {
      return false;
    }
    this.data = string.sub(this.data, this.pos) + more;
    this.pos = 1;
    return true;
  }

  /** The next `n` bytes, or `undefined` when the connection is over. */
  bytes(n: number) {
    // the parts are joined once, so that each byte is copied only twice
    const parts: string[] = [];
    let left = n;
    while (this.data.length - this.pos + 1 < left) {
      const rest = string.sub(this.data, this.pos);
      parts.push(rest);
      left -= rest.length;
      const more = this.read();
      if (more === undefined) {
        return undefined;
      }
      this.data = more;
      this.pos = 1;
    }
    parts.push(string.sub(this.data, this.pos, this.pos + left - 1));
    this.pos += left;
    return parts.join("");
  }

  /**
   * The next line of a chunked body, without its end (CRLF, or a bare LF as
   * in the head); `tooLong` when it has more than `max` bytes, an error
   * when it has a bare CR (as in the head), or `undefined` when the
   * connection is over.
   */
  line(max: number, tooLong: BodyError): string | BodyError | undefined {
    while (true) {
      const [start, end] = string.find(this.data, "\r?\n", this.pos);
      if (start !== undefined) {
        const line = string.sub(this.data, this.pos, start - 1);
        this.pos = end + 1;
        if (line.length > max) {
          return tooLong;
        }
        return string.find(line, "\r", 1, true)[0] === undefined
          ? line
          : INVALID_CHUNKED;
      }
      // the bytes of a line that fits, and the CR of its end
      if (this.data.length - this.pos + 1 > max + 1) {
        return tooLong;
      }
      if (!this.fill()) {
        return undefined;
      }
    }
  }
}

/**
 * The length of a body by the value of `Content-Length`: decimal digits, or
 * a list of the same length (a header that comes more than once). Gives
 * `undefined` when the value is invalid.
 */
export const contentLength = (value: string) => {
  let length: number | undefined;
  for (const [part] of string.gmatch(`${value},`, "([^,]*),")) {
    const [digits] = string.match(part, "^%s*(%d+)%s*$");
    if (digits === undefined) {
      return undefined;
    }
    const n = tonumber(digits)!;
    if (length !== undefined && n !== length) {
      return undefined;
    }
    length = n;
  }
  return length;
};

/**
 * Decodes a chunked body: the data of all its chunks. Drops the chunk
 * extensions and the trailer fields. Gives an error when the body is
 * invalid (also when a line has a bare CR), when its data has more than
 * `max` bytes (413), when the chunk extensions together have more than
 * `maxLine` bytes (413; with the leading zeros and the whitespace of the
 * sizes), or when the trailer fields together have more than `maxLine` bytes
 * (431). Gives `undefined` when the connection is over.
 */
export const readChunked = (
  reader: BodyReader,
  max: number,
  maxLine: number,
): string | BodyError | undefined => {
  const parts: string[] = [];
  let size = 0;
  /**
   * The bytes of the size lines other than their significant digits, so
   * that the lines cannot be much longer than the data.
   */
  let extensions = 0;
  while (true) {
    const line = reader.line(maxLine, EXTENSIONS_TOO_LARGE);
    if (typeof line !== "string") {
      return line;
    }
    // the size in hex digits, then the extensions, each after a `;`
    const [hex, rest] = string.match(line, "^(%x+)[ \t]*(.*)$");
    if (hex === undefined || (rest !== "" && !rest!.startsWith(";"))) {
      return INVALID_CHUNKED;
    }
    const digits = string.gsub(hex, "^0+", "")[0];
    extensions += line.length - digits.length;
    if (extensions > maxLine) {
      return EXTENSIONS_TOO_LARGE;
    }
    if (digits === "") {
      break; // the last chunk
    }
    // more than 8 hex digits do not fit into 32 bits, and are too large
    const n = digits.length <= 8 ? tonumber(digits, 16)! : math.huge;
    size += n;
    if (size > max) {
      return [413, "the body is too large"];
    }
    const data = reader.bytes(n);
    if (data === undefined) {
      return undefined;
    }
    parts.push(data);
    // the line end after the data of a chunk
    const end = reader.line(0, INVALID_CHUNKED);
    if (typeof end !== "string") {
      return end;
    }
  }
  let trailers = 0;
  while (true) {
    const line = reader.line(maxLine, TRAILERS_TOO_LARGE);
    if (typeof line !== "string") {
      return line;
    }
    if (line === "") {
      return parts.join("");
    }
    trailers += line.length;
    if (trailers > maxLine) {
      return TRAILERS_TOO_LARGE;
    }
  }
};

/** The headers that only the server sets, in lower case. */
const RESERVED: Record<string, true> = {
  "content-length": true,
  connection: true,
  "transfer-encoding": true,
};

/**
 * The bytes of `response`, after which the connection closes, and whether
 * the response has a body. The bytes are the head, and the body when it is a
 * string. A stream body follows the head until the connection closes, so its
 * head has no `Content-Length`. A 204 or 304 response has no body, so also no
 * stream.
 */
export const formatResponse = (
  response: ServerResponse,
): [bytes: string, withBody: boolean] => {
  const status = response.status ?? 200;
  const headers: HeaderMap = {};
  for (const [name, value] of Object.entries(response.headers ?? {})) {
    if (RESERVED[name.toLowerCase()] === undefined) {
      headers[name] = value;
    }
  }
  const lines = [
    // the reason phrase can be empty (RFC 9112, section 4)
    `HTTP/1.1 ${status} ${REASONS[status] ?? ""}`,
    ...headerLines(headers),
  ];
  const body = response.body;
  const withBody = status !== 204 && status !== 304;
  const text = withBody && typeof body === "string" ? body : "";
  if (withBody && !(body instanceof EventStream)) {
    lines.push(`Content-Length: ${text.length}`);
  }
  lines.push("Connection: close", "", "");
  return [lines.join("\r\n") + text, withBody];
};

// An HTTP client that uses WinINet (part of Windows, so there is no DLL to
// ship). The blocking calls run on native threads (see `thread.ts`), so the
// game does not stop. The API is the one of `HttpClient` of
// `@noita-ts/pollnet`.

import ffi, { type Ptr } from "@noita-ts/ffi";
import { Pool } from "./thread";

ffi.cdef(`
  void* InternetOpenA(const char* agent, uint32_t access, const char* proxy, const char* bypass, uint32_t flags);
  void* InternetConnectA(void* internet, const char* server, uint16_t port, const char* user, const char* password, uint32_t service, uint32_t flags, uintptr_t context);
  void* HttpOpenRequestA(void* connect, const char* verb, const char* object, const char* version, const char* referrer, const char** accept, uint32_t flags, uintptr_t context);
  int HttpSendRequestA(void* request, const char* headers, uint32_t headers_length, void* optional, uint32_t optional_length);
  int InternetSetOptionA(void* internet, uint32_t option, void* buffer, uint32_t length);
  int InternetReadFile(void* file, void* buffer, uint32_t size, uint32_t* read);
  int HttpQueryInfoA(void* request, uint32_t info, void* buffer, uint32_t* length, uint32_t* index);
  int InternetCloseHandle(void* internet);
  uint32_t GetLastError();
`);

// the game loads wininet.dll itself and never unloads it, so a thread can
// still run in it after this library handle is freed with the Lua state
const wininet = ffi.load("wininet.dll");

const INTERNET_OPEN_TYPE_PRECONFIG = 0;
const INTERNET_SERVICE_HTTP = 3;
const INTERNET_OPTION_CONNECT_TIMEOUT = 2;
const INTERNET_OPTION_SEND_TIMEOUT = 5;
const INTERNET_OPTION_RECEIVE_TIMEOUT = 6;
const INTERNET_FLAG_RELOAD = 0x80000000;
const INTERNET_FLAG_NO_CACHE_WRITE = 0x04000000;
const INTERNET_FLAG_SECURE = 0x00800000;
const INTERNET_FLAG_NO_COOKIES = 0x00080000;
const INTERNET_FLAG_IGNORE_REDIRECT_TO_HTTP = 0x00008000;
const INTERNET_FLAG_IGNORE_REDIRECT_TO_HTTPS = 0x00004000;
const INTERNET_FLAG_NO_UI = 0x00000200;
const HTTP_QUERY_STATUS_CODE = 19;
const HTTP_QUERY_RAW_HEADERS_CRLF = 22;
const HTTP_QUERY_FLAG_NUMBER = 0x20000000;

/** The size of one read of the body. */
const CHUNK = 256 * 1024;

/** Names of the common WinINet errors, for the error messages. */
const ERRORS: Record<number, string> = {
  12002: "timeout",
  12005: "invalid URL",
  12006: "unrecognized scheme",
  12007: "name not resolved",
  12029: "cannot connect",
  12030: "connection aborted",
  12031: "connection reset",
  12037: "certificate date invalid",
  12038: "certificate name invalid",
  12045: "invalid certificate authority",
  12057: "certificate revocation check failed",
  12152: "invalid server response",
  12157: "security channel error",
  12169: "invalid certificate",
  12170: "certificate revoked",
  12175: "decoding failed",
};

const describe = (error: number) => {
  const name = ERRORS[error];
  return name !== undefined
    ? `WinINet error ${error} (${name})`
    : `WinINet error ${error}`;
};

export class HttpResponse {
  status: number;
  headers: string;
  body: string;

  constructor(status: number, headers: string, body: string) {
    this.status = status;
    this.headers = headers;
    this.body = body;
  }

  /**
   * Parse the raw header block into a map.
   * Header names seen more than once collapse into an array of their values, in
   * order.
   */
  parseHeaders(): Record<string, string | string[]> {
    const headers: Record<string, string | string[]> = {};
    for (const line of this.headers.split("\n")) {
      // split at the first separator only, as a value can contain one too
      const sep = line.indexOf(": ");
      const key = line.slice(0, sep);
      const value = line.slice(sep + 2);
      if (sep <= 0 || !value) {
        continue;
      }
      const prev = headers[key];
      if (!prev) {
        headers[key] = value;
        continue;
      }
      if (Array.isArray(prev)) {
        (prev as string[]).push(value);
      } else {
        headers[key] = [prev as string, value];
      }
    }
    return headers;
  }
}

/** The headers of a request: a map, or lines separated by `\n`. */
export type Headers = Record<string, string | string[]> | string;

/**
 * Anything that looks, walks and quacks like a scheduler (to not depend on
 * `@noita-ts/base` directly).
 * Import and set up a `Scheduler` from `@noita-ts/base/async` for this.
 */
interface Scheduler {
  spawn<T>(body: () => T): Promise<T>;
}

export interface HttpClientOptions {
  /** The `User-Agent` of the requests. Defaults to `noita-ts/wininet`. */
  userAgent?: string;
  /**
   * The timeout of a connection, of a send and of a receive, in
   * milliseconds. Defaults to 30 seconds.
   */
  timeoutMs?: number;
}

/** A URL, split into the parts that WinINet takes. */
const parseUrl = (url: string) => {
  const [scheme, host, port, rest] = string.match(
    url,
    "^(%a[%w+.-]*)://([^/:?#]+):?(%d*)(.*)$",
  );
  const lower = scheme?.toLowerCase();
  if (lower !== "http" && lower !== "https") {
    throw new Error(`not an http or https URL: ${url}`);
  }
  const secure = lower === "https";
  // the fragment is for the client only
  let path = string.gsub(rest, "#.*$", "")[0];
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return {
    secure,
    host,
    port: port !== "" ? tonumber(port)! : secure ? 443 : 80,
    path,
  };
};

/** Headers as WinINet takes them: `Key: value` lines, each ended by CRLF. */
const formatHeaders = (headers: Headers) => {
  const lines: string[] = [];
  if (typeof headers === "string") {
    for (const line of headers.split("\n")) {
      lines.push(string.gsub(line, "\r$", "")[0]);
    }
  } else {
    const keys = Object.keys(headers);
    keys.sort();
    for (const key of keys) {
      const value = headers[key]!;
      for (const v of typeof value === "string" ? [value] : value) {
        lines.push(`${key}: ${v}`);
      }
    }
  }
  return lines
    .filter((line) => line !== "")
    .map((line) => `${line}\r\n`)
    .join("");
};

/**
 * The response headers as `HttpResponse` of pollnet has them: `Key: value`
 * lines separated by `\n`, without the status line.
 */
const responseHeaders = (raw: string) => {
  const lines = string.gsub(raw, "\r\n", "\n")[0].split("\n");
  return lines
    .slice(1)
    .filter((line) => line !== "")
    .join("\n");
};

/** The kinds of the WinINet handles of a request, children first. */
const REQUEST = 1;
const CONNECT = 2;

/**
 * An async HTTP client built on top of a {@link Scheduler}.
 *
 * Requests run in coroutines and resolve to an {@link HttpResponse}. The
 * blocking WinINet calls run on native threads, so the game runs while a
 * request waits.
 *
 * A client keeps a WinINet session until the Lua state is closed, so make one
 * client and keep it. When the state is closed, the client closes its handles
 * and frees its memory; the thread of a request that still runs frees the
 * memory of its call when the call ends.
 */
export class HttpClient {
  private scheduler: Scheduler;
  private userAgent: string;
  private timeoutMs: number;
  private internet: unknown;
  /** The open request and connection handles, with their kinds. */
  private handles = new LuaTable<object, number>();
  /** The memory that the threads of the requests use. */
  private pool = new Pool();
  private released = false;
  /** Removes the release of this client from the release of the state. */
  private unregister: (this: void) => void;

  constructor(scheduler: Scheduler, options?: HttpClientOptions) {
    this.scheduler = scheduler;
    this.userAgent = options?.userAgent ?? "noita-ts/wininet";
    this.timeoutMs = options?.timeoutMs ?? 30_000;
    this.unregister = ffi.onRelease(() => this._release());
  }

  /**
   * Perform an HTTP GET.
   */
  get(url: string, headers?: Headers): Promise<HttpResponse> {
    return this.request("GET", url, headers ?? "", "");
  }

  /**
   * Perform an HTTP POST with an optional request `body`.
   *
   * Without `headers`, the request has
   * `content-type: application/x-www-form-urlencoded`, as in pollnet.
   */
  post(url: string, headers?: Headers, body?: string): Promise<HttpResponse> {
    return this.request(
      "POST",
      url,
      headers ?? { ["content-type"]: "application/x-www-form-urlencoded" },
      body ?? "",
    );
  }

  /**
   * Does now what closing the Lua state does: closes the WinINet handles of
   * the client and frees its memory. A request that runs is abandoned: its
   * promise rejects, and its thread frees the memory of its call when the call
   * ends. The client takes no requests after that.
   *
   * Only for tests.
   *
   * @internal
   */
  _release() {
    if (this.released) {
      return;
    }
    this.released = true;
    this.unregister();

    // on Windows, closing a handle that a thread uses also cancels its call;
    // Wine lets the call run until it ends or times out
    for (const kind of [REQUEST, CONNECT]) {
      for (const [handle, k] of this.handles) {
        if (k === kind) {
          wininet.InternetCloseHandle(handle);
        }
      }
    }
    this.handles = new LuaTable();
    if (this.internet !== undefined) {
      wininet.InternetCloseHandle(this.internet);
      this.internet = undefined;
    }

    this.pool.release();
  }

  /** Remembers `handle` until `close`, or until the client is released. */
  private track(handle: object, kind: number) {
    if (handle != null) {
      this.handles.set(handle, kind);
    }
    return handle;
  }

  /** Closes a handle of `track`, unless the release closed it already. */
  private close(handle: object) {
    if (this.handles.has(handle)) {
      this.handles.delete(handle);
      wininet.InternetCloseHandle(handle);
    }
  }

  /**
   * The WinINet session of this client, made on first use. It stays open
   * until the client is released, so that WinINet can keep the connections
   * alive.
   */
  private open() {
    if (this.released) {
      throw new Error("the client is released");
    }
    if (this.internet === undefined) {
      const internet = wininet.InternetOpenA(
        this.userAgent,
        INTERNET_OPEN_TYPE_PRECONFIG,
        null,
        null,
        0,
      );
      if (internet == null) {
        throw new Error(`cannot open WinINet: ${describe(ffi.C.GetLastError())}`);
      }
      this.setTimeouts(internet);
      this.internet = internet;
    }
    return this.internet;
  }

  /**
   * Sets the timeouts of a handle. Wine takes the send and receive timeouts
   * only from a connection handle, and waits forever without them, so each
   * connection gets them too.
   */
  private setTimeouts(handle: unknown) {
    const timeout = ffi.new("uint32_t[1]", this.timeoutMs);
    for (const option of [
      INTERNET_OPTION_CONNECT_TIMEOUT,
      INTERNET_OPTION_SEND_TIMEOUT,
      INTERNET_OPTION_RECEIVE_TIMEOUT,
    ]) {
      wininet.InternetSetOptionA(handle, option, timeout, 4);
    }
  }

  private request(
    method: string,
    url: string,
    headers: Headers,
    body: string,
  ): Promise<HttpResponse> {
    return this.scheduler.spawn(() => {
      const { secure, host, port, path } = parseUrl(url);
      const fail = (what: string, error: number): never => {
        throw new Error(`${method} ${url}: ${what}: ${describe(error)}`);
      };

      // no network yet, so these run on the main thread
      const connect = this.track(
        wininet.InternetConnectA(
          this.open(),
          host,
          port,
          null,
          null,
          INTERNET_SERVICE_HTTP,
          0,
          0,
        ),
        CONNECT,
      );
      if (connect == null) {
        fail("cannot connect", ffi.C.GetLastError());
      }
      try {
        this.setTimeouts(connect);
        let flags =
          INTERNET_FLAG_RELOAD |
          INTERNET_FLAG_NO_CACHE_WRITE |
          INTERNET_FLAG_NO_COOKIES |
          INTERNET_FLAG_NO_UI |
          // follow redirects between http and https too, as pollnet does
          INTERNET_FLAG_IGNORE_REDIRECT_TO_HTTP |
          INTERNET_FLAG_IGNORE_REDIRECT_TO_HTTPS;
        if (secure) {
          flags |= INTERNET_FLAG_SECURE;
        }
        const request = this.track(
          wininet.HttpOpenRequestA(
            connect,
            method,
            path,
            null,
            null,
            null,
            flags,
            0,
          ),
          REQUEST,
        );
        if (request == null) {
          fail("cannot open the request", ffi.C.GetLastError());
        }
        try {
          return this.exchange(request, headers, body, fail);
        } finally {
          this.close(request);
        }
      } finally {
        this.close(connect);
      }
    });
  }

  /** Sends the request and reads the response. */
  private exchange(
    request: object,
    headers: Headers,
    body: string,
    fail: (what: string, error: number) => never,
  ) {
    const formatted = formatHeaders(headers);
    // arguments on a thread are never `undefined`, see `Arg` of `thread.ts`
    const [sent, sendError] = this.pool.run(
      wininet.HttpSendRequestA,
      request,
      formatted !== "" ? formatted : 0,
      formatted.length,
      body !== "" ? body : 0,
      body.length,
    );
    if (sent === 0) {
      fail("cannot send the request", sendError);
    }

    const status = ffi.new("uint32_t[1]");
    const length = ffi.new("uint32_t[1]", 4);
    if (
      wininet.HttpQueryInfoA(
        request,
        HTTP_QUERY_STATUS_CODE | HTTP_QUERY_FLAG_NUMBER,
        status,
        length,
        null,
      ) === 0
    ) {
      fail("no status in the response", ffi.C.GetLastError());
    }

    // the first call fails and gives the size that the headers need
    length[0] = 0;
    wininet.HttpQueryInfoA(request, HTTP_QUERY_RAW_HEADERS_CRLF, null, length, null);
    let raw = "";
    if (length[0] > 0) {
      const buffer = ffi.new("char[?]", length[0] + 1);
      if (
        wininet.HttpQueryInfoA(
          request,
          HTTP_QUERY_RAW_HEADERS_CRLF,
          buffer,
          length,
          null,
        ) === 0
      ) {
        fail("cannot read the response headers", ffi.C.GetLastError());
      }
      raw = ffi.string(buffer, length[0]);
    }

    // the thread writes into these, so they come from the pool
    const buffer = this.pool.alloc<object>("uint8_t*", CHUNK);
    const read = this.pool.alloc<Ptr<number>>("uint32_t*", 4);
    const parts: string[] = [];
    try {
      while (true) {
        const [ok, error] = this.pool.run(
          wininet.InternetReadFile,
          request,
          buffer,
          CHUNK,
          read,
        );
        if (ok === 0) {
          fail("cannot read the response", error);
        }
        if (read[0] === 0) {
          break;
        }
        parts.push(ffi.string(buffer, read[0]));
      }
    } finally {
      this.pool.free(buffer);
      this.pool.free(read);
    }

    return new HttpResponse(
      status[0] as number,
      responseHeaders(raw),
      parts.join(""),
    );
  }
}

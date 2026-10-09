// An HTTP client that uses WinINet (part of Windows, so there is no DLL to
// ship). The blocking calls run on native threads (see `thread.ts`), so the
// game does not stop. The API is the one of `HttpClient` of
// `@noita-ts/pollnet`, except that the headers of a request are only a map.

import ffi, { type Ptr } from "@noita-ts/ffi";
import {
  describeError,
  type HeaderMap,
  headerLines,
  type Scheduler,
} from "../common";
import { lastError, Pool } from "./thread";

ffi.cdef(`
  void* InternetOpenA(const char* agent, uint32_t access, const char* proxy, const char* bypass, uint32_t flags);
  void* InternetConnectA(void* internet, const char* server, uint16_t port, const char* user, const char* password, uint32_t service, uint32_t flags, uintptr_t context);
  void* HttpOpenRequestA(void* connect, const char* verb, const char* object, const char* version, const char* referrer, const char** accept, uint32_t flags, uintptr_t context);
  int HttpSendRequestA(void* request, const char* headers, uint32_t headers_length, void* optional, uint32_t optional_length);
  int InternetSetOptionA(void* internet, uint32_t option, void* buffer, uint32_t length);
  int InternetReadFile(void* file, void* buffer, uint32_t size, uint32_t* read);
  int HttpQueryInfoA(void* request, uint32_t info, void* buffer, uint32_t* length, uint32_t* index);
  int InternetCloseHandle(void* internet);
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
const ERROR_INSUFFICIENT_BUFFER = 122;
const ERROR_HTTP_INVALID_SERVER_RESPONSE = 12152;

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
};

const describe = (error: number) => describeError("WinINet", error, ERRORS);

/** Throws the error of a failed WinINet call. */
const fail = (what: string, error: number): never => {
  throw new Error(`${what}: ${describe(error)}`);
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
  parseHeaders(): HeaderMap {
    const headers: HeaderMap = {};
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
        prev.push(value);
      } else {
        headers[key] = [prev, value];
      }
    }
    return headers;
  }
}

export interface HttpClientOptions {
  /** The `User-Agent` of the requests. Defaults to `noita-ts/http`. */
  userAgent?: string;
  /**
   * The timeout of a connection, of a send and of a receive, in
   * milliseconds: an integer from 1 to 4294967295. Defaults to 30 seconds.
   */
  timeoutMs?: number;
}

/**
 * A URL, split into the parts that WinINet takes. The errors do not have the
 * URL: the request adds it.
 */
const parseUrl = (url: string) => {
  const [scheme, authority, rest] = string.match(
    url,
    "^(%a[%w+.-]*)://([^/?#]*)(.*)$",
  );
  const lower = scheme?.toLowerCase();
  if (lower !== "http" && lower !== "https") {
    throw new Error("not an http or https URL");
  }
  const [host, port] = string.match(authority!, "^([^:]+):?(%d*)$");
  if (host === undefined || port === undefined) {
    throw new Error("an invalid host or port");
  }
  const secure = lower === "https";
  // the fragment is for the client only
  let path = string.gsub(rest!, "#.*$", "")[0];
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
const formatHeaders = (headers: HeaderMap) =>
  headerLines(headers)
    .map((line) => `${line}\r\n`)
    .join("");

/**
 * The response headers as `HttpResponse` of pollnet has them: `Key: value`
 * lines separated by `\n`, without the status line. The separator becomes
 * `: `, also when the server sent no space after the colon or more than one.
 */
const responseHeaders = (raw: string) =>
  raw
    .split("\r\n")
    .slice(1)
    .filter((line) => line !== "")
    .map((line) => string.gsub(line, "^([^:]*):[ \t]*", "%1: ", 1)[0])
    .join("\n");

/**
 * An async HTTP client built on top of a {@link Scheduler}.
 *
 * Requests run in coroutines and resolve to an {@link HttpResponse}. The
 * blocking WinINet calls run on native threads, so the game runs while a
 * request waits.
 *
 * A client keeps a WinINet session until it is closed with {@link close} or
 * the Lua state is closed, so make one client and keep it. Then the client
 * closes its handles and frees its memory; the thread of a request that
 * still runs frees the memory of its call when the call ends.
 */
export class HttpClient {
  private userAgent: string;
  /** The timeout of all the handles, in milliseconds. */
  private timeout: Ptr<number>;
  private internet: unknown;
  /** The open request handles. */
  private requests = new LuaSet<object>();
  /** The open connection handles, the parents of the request handles. */
  private connects = new LuaSet<object>();
  /** The memory that the threads of the requests use. */
  private pool = new Pool();
  private closed = false;
  /** Removes the close of this client from the release of the state. */
  private unregister: (this: void) => void;

  constructor(
    private scheduler: Scheduler,
    options?: HttpClientOptions,
  ) {
    this.userAgent = options?.userAgent ?? "noita-ts/http";
    this.timeout = ffi.new("uint32_t[1]", options?.timeoutMs ?? 30_000);
    this.unregister = ffi.onRelease(() => this.close());
  }

  /**
   * Perform an HTTP GET.
   */
  get(url: string, headers?: HeaderMap): Promise<HttpResponse> {
    return this.request("GET", url, headers ?? {}, "");
  }

  /**
   * Perform an HTTP POST with an optional request `body`.
   *
   * Without `headers`, the request has
   * `content-type: application/x-www-form-urlencoded`, as in pollnet.
   */
  post(
    url: string,
    headers?: HeaderMap,
    body?: string,
  ): Promise<HttpResponse> {
    return this.request(
      "POST",
      url,
      headers ?? { "content-type": "application/x-www-form-urlencoded" },
      body ?? "",
    );
  }

  /**
   * Closes the WinINet handles of the client and frees its memory, as closing
   * the Lua state does. A request that runs is abandoned: its promise
   * rejects, and its thread frees the memory of its call when the call ends.
   * The client takes no requests after that.
   */
  close() {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this.unregister();

    // on Windows, closing a handle that a thread uses also cancels its call;
    // Wine lets the call run until it ends or times out; children first
    for (const handles of [this.requests, this.connects]) {
      for (const handle of handles) {
        wininet.InternetCloseHandle(handle);
      }
    }
    this.requests = new LuaSet();
    this.connects = new LuaSet();
    if (this.internet !== undefined) {
      wininet.InternetCloseHandle(this.internet);
      this.internet = undefined;
    }

    this.pool.release();
  }

  /** Closes a handle of `handles`, unless {@link close} closed it already. */
  private closeHandle(handles: LuaSet<object>, handle: object) {
    if (handles.has(handle)) {
      handles.delete(handle);
      wininet.InternetCloseHandle(handle);
    }
  }

  /**
   * The WinINet session of this client, made on first use. It stays open
   * until the client is closed, so that WinINet can keep the connections
   * alive.
   */
  private open() {
    if (this.closed) {
      throw new Error("the client is closed");
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
        fail("cannot open WinINet", lastError());
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
    for (const option of [
      INTERNET_OPTION_CONNECT_TIMEOUT,
      INTERNET_OPTION_SEND_TIMEOUT,
      INTERNET_OPTION_RECEIVE_TIMEOUT,
    ]) {
      wininet.InternetSetOptionA(handle, option, this.timeout, 4);
    }
  }

  /**
   * Performs a request in a coroutine. All of its errors start with the
   * method and the URL. A request that the close of the client abandons, or
   * that comes after it, fails with `the client is closed`.
   */
  private request(
    method: string,
    url: string,
    headers: HeaderMap,
    body: string,
  ): Promise<HttpResponse> {
    return this.scheduler.spawn(() => {
      try {
        return this.perform(method, url, headers, body);
      } catch (e) {
        // after the close, every error comes from the close
        const message = this.closed
          ? "the client is closed"
          : e instanceof Error
            ? e.message
            : tostring(e);
        throw new Error(`${method} ${url}: ${message}`);
      }
    });
  }

  /** Performs a request. */
  private perform(
    method: string,
    url: string,
    headers: HeaderMap,
    body: string,
  ) {
    // parse the URL before a handle is open
    const { secure, host, port, path } = parseUrl(url);
    const formatted = formatHeaders(headers);

    // no network yet, so these run on the main thread
    const connect = wininet.InternetConnectA(
      this.open(),
      host,
      port,
      null,
      null,
      INTERNET_SERVICE_HTTP,
      0,
      0,
    );
    if (connect == null) {
      fail("cannot open the connection", lastError());
    }
    this.connects.add(connect);
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
      const request = wininet.HttpOpenRequestA(
        connect,
        method,
        path,
        null,
        null,
        null,
        flags,
        0,
      );
      if (request == null) {
        fail("cannot open the request", lastError());
      }
      this.requests.add(request);
      try {
        return this.exchange(request, formatted, body);
      } finally {
        this.closeHandle(this.requests, request);
      }
    } finally {
      this.closeHandle(this.connects, connect);
    }
  }

  /**
   * Sends the request, with the headers that {@link formatHeaders} gives, and
   * reads the response.
   */
  private exchange(request: object, formatted: string, body: string) {
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
      fail("no status in the response", lastError());
    }
    // Wine takes a connection that closes before the status line as a
    // response with status 0, where Windows fails with 12152
    if (status[0] === 0) {
      fail("no response", ERROR_HTTP_INVALID_SERVER_RESPONSE);
    }

    // the first call fails and gives the size that the headers need
    length[0] = 0;
    if (
      wininet.HttpQueryInfoA(
        request,
        HTTP_QUERY_RAW_HEADERS_CRLF,
        null,
        length,
        null,
      ) === 0
    ) {
      const error = lastError();
      if (error !== ERROR_INSUFFICIENT_BUFFER) {
        fail("cannot read the response headers", error);
      }
    }
    let raw = "";
    if (length[0] > 0) {
      // the size includes the terminating null
      const headerBuffer = ffi.new("char[?]", length[0]);
      if (
        wininet.HttpQueryInfoA(
          request,
          HTTP_QUERY_RAW_HEADERS_CRLF,
          headerBuffer,
          length,
          null,
        ) === 0
      ) {
        fail("cannot read the response headers", lastError());
      }
      raw = ffi.string(headerBuffer, length[0]);
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

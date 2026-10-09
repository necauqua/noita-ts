// An HTTP/1.1 server on Winsock (part of Windows, so there is no DLL to
// ship). The sockets are non-blocking, and coroutines of a scheduler poll
// them once per poll of the scheduler, so the game does not stop, no native
// thread is necessary, and nothing of this module runs after the Lua state is
// closed.

import ffi from "@noita-ts/ffi";
import type { HeaderMap, Scheduler } from "../common";
import {
  plain,
  type RequestHandler,
  type ServerRequest,
  type ServerResponse,
} from "./message";
import { EventStream } from "./stream";
import {
  BodyReader,
  contentLength,
  formatResponse,
  parseHead,
  readChunked,
} from "./wire";
import {
  accept,
  cleanup,
  closeSocket,
  drain,
  listenAt,
  now,
  parseAddress,
  receive,
  send,
  shutdownSend,
  startup,
} from "./winsock";
import { headerName, printError, withDefaults } from "./util";

/**
 * The most bytes of the request line and the headers (with the empty lines
 * before the request line), and of the trailer fields of a chunked body (else
 * 431), and of its chunk extensions (else 413).
 */
const MAX_HEAD_BYTES = 16 * 1024;
/** The default of {@link HttpServerOptions.maxBodyBytes}. */
const MAX_BODY_BYTES = 1024 * 1024;
/**
 * The time that a client can take to send the head of its request, the time
 * that it can send no bytes of its body, and the time that it can take no
 * bytes of a response.
 */
const TIMEOUT_MS = 10_000;
/** The interim response to `Expect: 100-continue`. */
const CONTINUE = "HTTP/1.1 100 Continue\r\n\r\n";
/**
 * The most time that the server waits, after a response, for the client to
 * close the connection: see {@link Connection.linger}.
 */
const LINGER_MS = 2_000;

export interface HttpServerOptions {
  /**
   * The IPv4 address to listen on, for example `0.0.0.0` for all the
   * addresses (then Windows can ask the player to let the game through its
   * firewall). Defaults to `127.0.0.1`.
   *
   * The server answers only the requests whose `Host` is an IPv4 address,
   * `localhost` or a name that ends with `.localhost` (see the readme), so a
   * client in the LAN must use the IPv4 address of the computer, not its
   * name.
   */
  host?: string;
  /**
   * The port from 1 to 65535, or 0 for a free one (see
   * {@link HttpServer.port}). Defaults to 0.
   */
  port?: number;
  /**
   * The most bytes of the body of a request (decoded, for a chunked body):
   * an integer from 0. A larger body gets 413. Defaults to 1 MiB.
   */
  maxBodyBytes?: number;
  /**
   * The origins whose pages can read the responses (CORS), for example
   * `["http://localhost:5173"]`, or `"*"` for all. With `"*"`, all the
   * responses get `Access-Control-Allow-Origin: *`. With a list, the responses
   * to a request with an allowed `Origin` get `Access-Control-Allow-Origin`,
   * and all the responses get `Vary: Origin`, for caches. There are no
   * answers to preflight requests, so only simple requests work (an
   * `EventSource`, a `fetch` GET, or a POST of a form or of `text/plain`).
   * By default, no other origin can read the responses.
   *
   * An origin of the list is `scheme://host` or `scheme://host:port`, in
   * lower case and without a path, as browsers send it in `Origin`.
   */
  allowedOrigins?: string[] | "*";
  /**
   * Gets the errors of the handlers (the client then gets a 500 response),
   * of the `onClose` functions of streams, and of the server itself.
   * Defaults to `print`. When it throws, both errors are printed.
   */
  onError?: (this: void, error: unknown, req?: ServerRequest) => void;
}

/**
 * Whether the server answers a request with the `Host` header `host`: only
 * IPv4 addresses, `localhost` and the names that end with `.localhost`. This
 * stops DNS rebinding: a web page at a domain whose address changes to
 * `127.0.0.1` cannot use that domain to read the responses of the server.
 */
const isAllowedHost = (host: string) => {
  // the port can be empty (RFC 3986, section 3.2.3); two patterns, as
  // `^([%w.-]+):?%d*$` takes quadratic time on a long run of digits
  const bare = string.gsub(host, ":%d*$", "")[0];
  if (string.find(bare, "^[%w.-]+$")[0] === undefined) {
    return false;
  }
  const name = string.gsub(bare.toLowerCase(), "%.$", "")[0];
  return (
    string.find(name, "^%d+%.%d+%.%d+%.%d+$")[0] !== undefined ||
    name === "localhost" ||
    name.endsWith(".localhost")
  );
};

/**
 * `headers` with `field` in its `Vary` (by the names in any case), unless
 * the `Vary` has it already.
 */
const addVary = (headers: HeaderMap, field: string): HeaderMap => {
  const name = headerName(headers, "Vary");
  if (name === undefined) {
    return { ...headers, Vary: field };
  }
  // a header that comes more than once is one list of all its values
  const vary = headers[name]!;
  const value = typeof vary === "string" ? vary : vary.join(", ");
  const listed = string.gsub(`,${value},`, "%s", "")[0].toLowerCase();
  const has = (item: string) =>
    string.find(listed, `,${item.toLowerCase()},`, 1, true)[0] !== undefined;
  // `*` must be the only value, and covers all the fields
  return has("*") || has(field)
    ? headers
    : { ...headers, [name]: `${value}, ${field}` };
};

/** A request, with the field that only the server changes. */
type PendingRequest = ServerRequest & { aborted: boolean };

/** A connection of a client: its socket, and the timeouts of its I/O. */
class Connection {
  /** The time when the current read or write gives up. */
  private deadline = 0;
  /** Whether the client got any bytes. */
  private wrote = false;

  constructor(
    private readonly s: number,
    /**
     * Whether the connection must stop now; when `idle` (before the request),
     * also when the server only closed.
     */
    private stopped: (this: void, idle: boolean) => boolean,
  ) {}

  /** Gives the next reads the whole timeout. */
  restart() {
    this.deadline = now() + TIMEOUT_MS;
  }

  /** Whether the time of the current read or write is over. */
  expired() {
    return now() > this.deadline;
  }

  /**
   * The next bytes from the client, or `undefined` when the connection is
   * over: the client closed it, an error, the timeout, or {@link stopped}.
   * When `idle`, the bytes that came before the server closed are still
   * read.
   */
  read(idle: boolean) {
    while (true) {
      // see `isGone`
      if (this.stopped(false)) {
        return undefined;
      }
      const data = receive(this.s);
      if (data === false) {
        return undefined;
      }
      if (data !== undefined) {
        return data;
      }
      // after the read, so that bytes that came while the polls stalled
      // still count
      if (this.expired() || (idle && this.stopped(true))) {
        return undefined;
      }
      coroutine.yield();
    }
  }

  /**
   * Sends all of `data`; false when the connection is over, also when the
   * client takes nothing for the whole timeout, or when `cancelled` holds.
   */
  write(data: string, cancelled?: (this: void) => boolean) {
    this.restart();
    let sent = 0;
    while (sent < data.length) {
      if (this.stopped(false) || cancelled?.()) {
        return false;
      }
      const n = send(this.s, data, sent);
      if (n === false) {
        return false;
      }
      sent += n;
      if (n === 0) {
        // after the send, as in `read`
        if (this.expired()) {
          return false;
        }
        coroutine.yield();
      } else {
        this.wrote = true;
        this.restart();
      }
    }
    return true;
  }

  /**
   * Whether the connection is over: the client closed it, or
   * {@link stopped} (also when not idle). Reads and drops what the client
   * sends after its request: each connection has one request, and bytes that
   * wait would hide the close.
   */
  isGone() {
    // after a release, the socket is closed, and its handle can belong to
    // another socket already
    return this.stopped(false) || drain(this.s);
  }

  /**
   * After a response: closes the sending side, and drops what the client
   * sends until it closes the connection too, for at most
   * {@link LINGER_MS}. Closing a socket that has bytes to read resets the
   * connection, and the client can then lose the response (for example a
   * 413 while it still sends its body).
   */
  linger() {
    // see `isGone`
    if (!this.wrote || this.stopped(false)) {
      return;
    }
    shutdownSend(this.s);
    const deadline = now() + LINGER_MS;
    // the drain first, as in `read`
    while (!this.isGone() && now() <= deadline) {
      coroutine.yield();
    }
  }
}

/**
 * An HTTP/1.1 server on non-blocking Winsock sockets, which coroutines of a
 * scheduler poll, so the game runs while the server waits.
 *
 * Each connection has one request: the server closes it after the response.
 * The server answers the requests of different connections at the same time.
 *
 * When the Lua state is closed, the server closes all of its sockets.
 */
export class HttpServer {
  /** The port that the server listens on. */
  readonly port: number;
  private maxBodyBytes: number;
  private allowedOrigins?: string[] | "*";
  private onError: (this: void, error: unknown, req?: ServerRequest) => void;
  private listener: number;
  private connections = new LuaSet<number>();
  /** The event streams that the server sends. */
  private streams = new LuaSet<EventStream>();
  /** No new connections; the open ones finish the request that they have. */
  private closed = false;
  /** All the sockets are closed, and Winsock is cleaned up. */
  private released = false;
  /** Removes the release of this server from the release of the state. */
  private unregister: (this: void) => void;

  /**
   * Starts to listen, and answers each request with `handler`. Throws if it
   * cannot listen, for example when another program has the port.
   */
  constructor(
    private scheduler: Scheduler,
    private handler: RequestHandler,
    options?: HttpServerOptions,
  ) {
    this.allowedOrigins = options?.allowedOrigins;
    this.maxBodyBytes = options?.maxBodyBytes ?? MAX_BODY_BYTES;
    const printFor = (
      error: unknown,
      req?: ServerRequest,
      what = "server",
    ) =>
      printError(
        req !== undefined ? `${what} ${req.method} ${req.target}` : what,
        error,
      );
    const onError = options?.onError ?? printFor;
    // an error of `onError` is printed, so that it cannot stop the answer to
    // a request
    this.onError = (error, req) => {
      try {
        onError(error, req);
      } catch (e) {
        printFor(error, req);
        printFor(e, req, "onError of the server");
      }
    };

    // Winsock counts its starts: each server starts it once, and cleans it up
    // once when it is released
    startup();
    try {
      [this.listener, this.port] = listenAt(
        parseAddress(options?.host ?? "127.0.0.1", options?.port ?? 0),
      );
    } catch (e) {
      cleanup();
      throw e;
    }
    this.unregister = ffi.onRelease(() => this._release());

    scheduler
      .spawn(() => this.acceptAll())
      .catch((e) => {
        // a server that accepts no connections must not keep its port
        this.close();
        this.onError(e);
      });
  }

  /**
   * Stops listening, and ends the event streams. The open connections still
   * get the response of the request that they have (also the one whose
   * handler closes the server), and then close. A connection whose async
   * handler never gives a response stays open until the client closes it, or
   * until the Lua state is closed.
   */
  close() {
    if (this.closed) {
      return;
    }
    this.closed = true;
    closeSocket(this.listener);
    for (const stream of this.streams) {
      stream.end();
    }
    this.releaseWhenDone();
  }

  /**
   * Does now what closing the Lua state does: closes all the sockets of the
   * server. The handlers that wait get no responses.
   *
   * Only for tests.
   *
   * @internal
   */
  _release() {
    this.close();
    for (const s of this.connections) {
      closeSocket(s);
    }
    this.connections = new LuaSet();
    this.releaseWhenDone();
  }

  /**
   * Releases the server when it is closed and has no connections: marks it
   * released and cleans up its start of Winsock.
   */
  private releaseWhenDone() {
    if (this.closed && !this.released && this.connections.isEmpty()) {
      this.released = true;
      this.unregister();
      cleanup();
    }
  }

  /** Accepts the new connections, once per poll, until the server closes. */
  private acceptAll() {
    /** The last error of `accept`: an error that each poll gets is reported once. */
    let lastError: string | undefined;
    // a handler can close the server (and its listener) between two accepts,
    // as the scheduler starts the coroutine of a connection at once
    while (!this.closed) {
      const s = accept(this.listener);
      if (typeof s !== "number") {
        // no more connections now, or an error: try again in the next poll
        if (s !== undefined && s.message !== lastError) {
          this.onError(s);
        }
        lastError = s?.message;
        coroutine.yield();
        continue;
      }
      lastError = undefined;
      const connection = new Connection(
        s,
        (idle) => this.released || (idle && this.closed),
      );
      this.connections.add(s);
      // for the errors that `serve` does not catch itself
      let req: ServerRequest | undefined;
      this.scheduler
        .spawn(() => {
          try {
            req = this.readRequest(connection);
            if (req !== undefined) {
              this.serve(connection, req);
            }
          } finally {
            // also after an error, so that the client gets what was sent
            connection.linger();
          }
        })
        .catch((e) => this.onError(e, req))
        .finally(() => this.closeConnection(s));
    }
  }

  private closeConnection(s: number) {
    if (this.connections.has(s)) {
      this.connections.delete(s);
      closeSocket(s);
    }
    this.releaseWhenDone();
  }

  /**
   * Answers with a plain-text error. `origin` is the `Origin` of the
   * request, when it has one, for the CORS headers.
   */
  private answerError(
    connection: Connection,
    status: number,
    text: string,
    origin?: string,
  ): undefined {
    connection.write(
      formatResponse(this.withCors(origin, plain(status, text)))[0],
    );
    return undefined;
  }

  /** Answers `req`, the request of `connection`. */
  private serve(connection: Connection, req: PendingRequest) {
    const response = this.answer(connection, req);
    if (response === undefined) {
      return; // the client is gone, or the server is released
    }
    const origin = req.headers["origin"];
    const report = (e: unknown) => this.onError(e, req);
    const body =
      response.body instanceof EventStream ? response.body : undefined;
    if (body !== undefined) {
      if (body._served) {
        // two connections would split its events, and both would finish it
        report(new Error("the event stream is the body of another response"));
        this.answerError(connection, 500, "server error", origin);
        return;
      }
      body._served = true;
    }

    const [bytes, withBody] = formatResponse(this.withCors(origin, response));
    if (body === undefined) {
      connection.write(bytes);
      return;
    }

    // a closed server ends its streams
    if (this.closed) {
      body.end();
    } else {
      this.streams.add(body);
    }
    try {
      if (connection.write(bytes) && withBody) {
        this.stream(connection, body);
      }
    } finally {
      this.streams.delete(body);
      body._finish(report);
    }
  }

  /**
   * Reads the request of `connection`, with its body. Answers an invalid
   * request with an error, and gives `undefined` then, or when the
   * connection is over.
   */
  private readRequest(connection: Connection): PendingRequest | undefined {
    connection.restart();

    // the request line and the headers; the server skips empty lines before
    // the request line, but they count toward the limit, so that a client
    // that only sends line ends cannot keep the connection open; a bare LF
    // ends a line too, and a bare CR makes the request invalid
    let data = "";
    /** The bytes of the skipped empty lines. */
    let skipped = 0;
    let start: number | undefined;
    let end: number | undefined;
    while (true) {
      let pos = 1;
      while (true) {
        const [, lineEnd] = string.find(data, "^\r?\n", pos);
        if (lineEnd === undefined) {
          break;
        }
        pos = lineEnd + 1;
      }
      skipped += pos - 1;
      data = string.sub(data, pos);
      [start, end] = string.find(data, "\r?\n\r?\n");
      if (start !== undefined) {
        break;
      }
      // the end of a head that fits (at most `\r\n\r\n`) would be in `data`
      if (skipped + data.length > MAX_HEAD_BYTES + 3) {
        return this.answerError(connection, 431, "the headers are too large");
      }
      // `read` returns bytes before it looks at the time, so a client that
      // sends a few bytes in each poll would never time out; bytes that
      // complete the head still count after the timeout, as in `read`
      if (connection.expired()) {
        return undefined;
      }
      const more = connection.read(data === "");
      if (more === undefined) {
        return undefined;
      }
      data += more;
    }
    if (skipped + start - 1 > MAX_HEAD_BYTES) {
      return this.answerError(connection, 431, "the headers are too large");
    }
    const parsed = parseHead(string.sub(data, 1, start - 1));
    if (parsed === undefined) {
      return this.answerError(connection, 400, "bad request");
    }
    const { minor, ...head } = parsed;
    const origin = head.headers["origin"];
    /** Answers with an error, with the CORS headers for `origin`. */
    const reject = (status: number, text: string) =>
      this.answerError(connection, status, text, origin);
    const host = head.headers["host"];
    if (host === undefined) {
      return reject(400, "the request has no host");
    }
    if (!isAllowedHost(host)) {
      return reject(403, "this host is not allowed");
    }

    // the length of the body, or `undefined` for a chunked body (RFC 9112,
    // section 6.3)
    const coding = head.headers["transfer-encoding"];
    const declared = head.headers["content-length"];
    let length: number | undefined;
    if (coding !== undefined) {
      // both could make a proxy and the server split the requests apart
      // differently
      if (declared !== undefined) {
        return reject(400, "both Content-Length and Transfer-Encoding");
      }
      if (coding.toLowerCase() !== "chunked") {
        return reject(501, "only chunked bodies are supported");
      }
    } else {
      length = declared !== undefined ? contentLength(declared) : 0;
      if (length === undefined) {
        return reject(400, "an invalid Content-Length");
      }
      if (length > this.maxBodyBytes) {
        return reject(413, "the body is too large");
      }
    }

    // each read of the body has the whole timeout; each read waits for the
    // next poll, so that a fast client cannot stop the game while its body is
    // decoded (at most 64 KiB per poll)
    const reader = new BodyReader(string.sub(data, end! + 1), () => {
      coroutine.yield();
      connection.restart();
      return connection.read(false);
    });
    // a client that sent only the head can wait for this before it sends the
    // body; HTTP/1.0 has no interim responses
    if (
      minor >= 1 &&
      length !== 0 &&
      reader.isEmpty() &&
      head.headers["expect"]?.toLowerCase() === "100-continue" &&
      !connection.write(CONTINUE)
    ) {
      return undefined;
    }
    const body =
      length !== undefined
        ? reader.bytes(length)
        : readChunked(reader, this.maxBodyBytes, MAX_HEAD_BYTES);
    if (body === undefined) {
      return undefined;
    }
    if (typeof body !== "string") {
      return reject(body[0], body[1]);
    }
    return { ...head, body, aborted: false };
  }

  /**
   * `response` with the CORS headers for a request with the `Origin`
   * `origin`: see {@link HttpServerOptions.allowedOrigins}. The headers of
   * the handler win, but `Origin` is added to its `Vary`.
   */
  private withCors(
    origin: string | undefined,
    response: ServerResponse,
  ): ServerResponse {
    const origins = this.allowedOrigins;
    if (origins === undefined) {
      return response;
    }
    // the same header for all the requests, so caches need no `Vary`
    if (origins === "*") {
      return {
        ...response,
        headers: withDefaults(response.headers, {
          "Access-Control-Allow-Origin": "*",
        }),
      };
    }
    let headers = response.headers ?? {};
    if (origin !== undefined && origins.includes(origin)) {
      headers = withDefaults(headers, { "Access-Control-Allow-Origin": origin });
    }
    // the response depends on the origin, also when it has no CORS header, so
    // caches must keep one response for each origin
    return { ...response, headers: addVary(headers, "Origin") };
  }

  /**
   * Sends the events of `body`, once per poll, until it ends, the client goes
   * away, the server is released, or too much waited to be sent (then at
   * once, also in the middle of a write).
   */
  private stream(connection: Connection, body: EventStream) {
    while (!body._stopped()) {
      const [data, ended] = body._take();
      if (data !== "") {
        const written = connection.write(data, () => body._stopped());
        body._sent(data.length);
        if (!written) {
          return;
        }
      }
      if (ended || connection.isGone()) {
        return;
      }
      coroutine.yield();
    }
  }

  /**
   * The response of the handler to `req`, or `undefined` when there is no one
   * to send it to. While an async handler waits, the server looks whether the
   * client closed the connection; then it sets `req.aborted`, and does not
   * wait for the response any more.
   */
  private answer(
    connection: Connection,
    req: PendingRequest,
  ): ServerResponse | undefined {
    let result: ServerResponse | Promise<ServerResponse>;
    try {
      result = this.handler.handle(req);
    } catch (e) {
      this.onError(e, req);
      return plain(500, "server error");
    }
    if (result instanceof Promise) {
      /** Set when the promise settles; `as`, as the callbacks set it. */
      let outcome = undefined as
        | { ok: true; value: ServerResponse }
        | { ok: false; error: unknown }
        | undefined;
      /** No one waits for the response any more. */
      let gone = false;
      result.then(
        (value) => {
          outcome = { ok: true, value };
          // the stream of a response that is not sent
          const body = value.body;
          if (gone && body instanceof EventStream && !body._served) {
            // no other response can send it now
            body._served = true;
            body._finish((e) => this.onError(e, req));
          }
        },
        (error) => {
          outcome = { ok: false, error };
          if (gone) {
            this.onError(error, req);
          }
        },
      );
      while (outcome === undefined) {
        if (connection.isGone()) {
          // a release closes the connection, not the client
          req.aborted = !this.released;
          gone = true;
          return undefined;
        }
        coroutine.yield();
      }
      if (!outcome.ok) {
        this.onError(outcome.error, req);
        return plain(500, "server error");
      }
      result = outcome.value;
    }
    return result;
  }
}

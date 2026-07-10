import pollnet from ".";

export namespace compat {
  /**
   * Run `body` inside a reactor coroutine and get its completion as a Promise.
   * `body` may freely use socket.await() / other yield-based pollnet APIs.
   * Errors inside body reject the promise.
   */
  export const asyncify = <T>(
    reactor: pollnet.Reactor,
    body: () => T,
  ): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      reactor.run(() => {
        try {
          resolve(body());
        } catch (e) {
          reject(e);
        }
      });
    });
  };

  /**
   * Parks the *current coroutine* until the promise settles, then returns its
   * value or rethrows its rejection.
   * Only call from inside a reactor coroutine (`reactor.run(() => { .. HERE .. })`).
   */
  export const yieldPromise = <T>(p: Promise<T>): T => {
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
  };
}

/**
 * Promise-friendly wrapper around a {@link pollnet.Reactor}.
 *
 * Lets you drive yield-based pollnet coroutines while exposing their results
 * as Promises. Call {@link poll} regularly (e.g. once per frame) to advance
 * all running coroutines.
 */
export class AsyncReactor {
  private reactor: pollnet.Reactor;

  constructor() {
    this.reactor = pollnet.Reactor();
  }

  /**
   * Advance every coroutine currently running on the reactor by one step.
   * Must be called periodically for spawned work to make progress.
   */
  poll() {
    return this.reactor.update();
  }

  /**
   * Run `body` as a reactor coroutine and return its result as a Promise.
   * `body` may use yield-based pollnet APIs (e.g. `socket.await()`).
   */
  spawn<T>(body: () => T): Promise<T> {
    return compat.asyncify(this.reactor, body);
  }

  /**
   * Async version of `pollnet.Reactor.run_server`.
   *
   * Accept connections on `server_sock`, spawning a coroutine that runs
   * `client_body` for each incoming client. `client_body` receives the client
   * socket and its remote address, and may itself return a Promise which the
   * coroutine parks on until it settles.
   */
  runServer(
    server_sock: pollnet.Socket,
    client_body: (sock: pollnet.Socket, addr: string) => Promise<void> | void,
  ) {
    server_sock.on_connection((client_sock, addr) => {
      this.reactor.run(() => {
        const r = client_body(client_sock, addr);
        if (r instanceof Promise) {
          compat.yieldPromise(r);
        }
      });
    });
    this.reactor.run(() => {
      while (server_sock.await()[0]) {}
    });
  }
}

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
      const [key, value] = line.split(": ", 2);
      if (!key || !value) {
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

/**
 * Tiny async HTTP client built on top of an {@link AsyncReactor}.
 * Requests run as reactor coroutines and resolve to an {@link HttpResponse}.
 */
export class HttpClient {
  private reactor: AsyncReactor;

  constructor(reactor: AsyncReactor) {
    this.reactor = reactor;
  }

  /**
   * Perform an HTTP GET.
   */
  get(
    url: string,
    headers?: Record<string, string | string[]> | string,
  ): Promise<HttpResponse> {
    return this.reactor.spawn(() => {
      const socket = pollnet.http_get(url, headers, false);
      const [msgs, error] = socket.await_n(3);
      if (!msgs) {
        throw new Error(`socket error: ${error}`);
      }
      const [statusStr, headersStr, respBody] = msgs;
      const status = tonumber(string.match("^%d+", statusStr)) ?? 500;
      return new HttpResponse(status, headersStr, respBody);
    });
  }

  /**
   * Perform an HTTP POST with an optional request `body`.
   */
  post(
    url: string,
    headers?: Record<string, string | string[]> | string,
    body?: string,
  ): Promise<HttpResponse> {
    return this.reactor.spawn(() => {
      const socket = pollnet.http_post(url, headers, body, false);
      const [msgs, error] = socket.await_n(3);
      if (!msgs) {
        throw new Error(`socket error: ${error}`);
      }
      const [statusStr, headersStr, respBody] = msgs;
      const status = tonumber(string.match("^%d+", statusStr)[0]) ?? 500;
      return new HttpResponse(status, headersStr, respBody);
    });
  }
}

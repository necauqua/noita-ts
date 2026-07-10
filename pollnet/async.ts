import pollnet from "./index";

/**
 * Run `body` inside a reactor coroutine and get its completion as a Promise.
 * `body` may freely use socket.await() / other yield-based pollnet APIs.
 * Errors inside body reject the promise.
 */
export const spawn = <T>(
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
export const blockOn = <T>(p: Promise<T>): T => {
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

export class HttpResponse {
  status: number;
  headers: string;
  body: string;

  constructor(status: number, headers: string, body: string) {
    this.status = status;
    this.headers = headers;
    this.body = body;
  }

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

export default class AsyncReactor {
  private reactor: pollnet.Reactor;

  constructor() {
    this.reactor = pollnet.Reactor();
  }

  update() {
    return this.reactor.update();
  }

  /** Runs a coroutine thread */
  run(thread_body: (this: pollnet.Reactor) => void) {
    this.reactor.run(thread_body);
  }

  /** Runs a server with client handler */
  run_server(
    server_sock: pollnet.Socket,
    client_body: (sock: pollnet.Socket, addr: string) => void,
  ) {
    this.reactor.run_server(server_sock, client_body);
  }

  http_get(
    url: string,
    headers?: Record<string, string | string[]> | string,
  ): Promise<HttpResponse> {
    return spawn(this.reactor, () => {
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

  http_post(
    url: string,
    headers?: Record<string, string | string[]> | string,
    body?: string,
  ): Promise<HttpResponse> {
    return spawn(this.reactor, () => {
      const socket = pollnet.http_post(url, headers, body, false);
      const [msgs, error] = socket.await_n(3);
      if (!msgs) {
        throw new Error(`socket error: ${error}`);
      }
      const [statusStr, headersStr, respBody] = msgs;
      const status = tonumber(string.match("^%d+", statusStr)) ?? 500;
      return new HttpResponse(status, headersStr, respBody);
    });
  }
}

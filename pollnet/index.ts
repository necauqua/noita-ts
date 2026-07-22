import pollnet from "./api";

export class HttpResponse {
  status: number;
  headers: string;
  body: string;

  constructor(status: number, headers: string, body: string) {
    this.status = status;
    this.headers = headers;
    this.body = body;
  }

  static read(socket: pollnet.Socket): HttpResponse {
    const [msgs, error] = socket.await_n(3);
    if (!msgs) {
      throw new Error(`socket error: ${error}`);
    }
    const [statusStr, headersStr, respBody] = msgs;
    const status = tonumber(string.match(statusStr, "^%d+")[0]) ?? 500;
    return new HttpResponse(status, headersStr, respBody);
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

// We accept anything that looks, walks and quacks like a scheduler
//  (to not depend on @noita-ts/base directly)
/**
 * Import and set up a `Scheduler` from `@noita-ts/base/async` for this.
 */
interface Scheduler {
  spawn<T>(body: () => T): Promise<T>;
}

/**
 * Tiny async HTTP client built on top of a {@link Scheduler}.
 *
 * Requests run in coroutines and resolve to an {@link HttpResponse}.
 */
export class HttpClient {
  private scheduler: Scheduler;

  constructor(scheduler: Scheduler) {
    this.scheduler = scheduler;
  }

  /**
   * Perform an HTTP GET.
   */
  get(
    url: string,
    headers?: Record<string, string | string[]> | string,
  ): Promise<HttpResponse> {
    return this.scheduler.spawn(() =>
      HttpResponse.read(pollnet.http_get(url, headers, false)),
    );
  }

  /**
   * Perform an HTTP POST with an optional request `body`.
   */
  post(
    url: string,
    headers?: Record<string, string | string[]> | string,
    body?: string,
  ): Promise<HttpResponse> {
    return this.scheduler.spawn(() =>
      HttpResponse.read(pollnet.http_post(url, headers, body, false)),
    );
  }
}

/**
 * Async WebSocket client built on top of an {@link AsyncReactor}.
 * Messages are delivered via the `onmessage` callback, and errors via
 * `onerror`.
 * Call {@link send} to send a message, and {@link close} to close the
 * connection and cleanup.
 */
export class WebSocket {
  private socket: pollnet.Socket | null;

  timeout = 3600; // 1 minute at 60 ups
  onmessage: ((msg: string) => void) | null = null;
  onerror: ((msg: string) => void) | null = null;

  constructor(scheduler: Scheduler, url: string) {
    this.socket = pollnet.open_ws(url);

    scheduler.spawn(() => {
      let timer = 0;
      while (!!this.socket) {
        let ok = true;
        let msg: string | undefined;

        // drain the queue
        while (true) {
          [ok, msg] = this.socket.poll();
          if (!ok || !msg) {
            break;
          }
          timer = 0;
          this.onmessage?.(msg);
          // onmessage may have called close()
          if (!this.socket) {
            return;
          }
        }

        if (ok && ++timer < this.timeout) {
          coroutine.yield();
          continue;
        }

        timer = 0;
        this.socket.close();
        this.onerror?.(msg ?? "timeout");
        for (let i = 0; i < 60; i++) {
          coroutine.yield();
        }
        // close() may have been called in the yields
        if (!!this.socket) {
          this.socket = pollnet.open_ws(url);
        }
      }
    });
  }

  send(message: string) {
    this.socket?.send(message);
  }

  sendBinary(data: string) {
    this.socket?.send_binary(data);
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }
}

export const runServer = (
  scheduler: Scheduler,
  serverSocket: pollnet.Socket,
  clientBody: (clientSocket: pollnet.Socket, addr: string) => void,
) => {
  serverSocket.on_connection((clientSocket, addr) => {
    scheduler
      .spawn(() => clientBody(clientSocket, addr))
      .catch((e) => {
        print(`Error in client handler for ${addr}: ${e}`);
        clientSocket.close();
      });
  });
  scheduler.spawn(() => {
    while (serverSocket.await()[0]) {}
  });
};

// The helpers of the tests of @noita-ts/http (in `tests/http-*.ts`). The
// hosts are IPv4 addresses: WinINet can take `localhost` as `::1`.
//
// Each test makes its own servers and clients, as `ffi._release` of the
// release test releases every client and server that exists at that moment.

import Scheduler from "@noita-ts/base/async";
import { assert, assertEq } from "@noita-ts/base/test";
import ffi from "@noita-ts/ffi";
import { HttpClient } from "@noita-ts/http/client";
import {
  HttpServer,
  type HttpServerOptions,
  type RequestHandler,
} from "@noita-ts/http/server";

export const scheduler = Scheduler.get();

/** A new client. */
export const client = () => new HttpClient(scheduler, { timeoutMs: 10_000 });

/**
 * Runs `body` with a new server and its URL, and closes the server after it.
 */
export const withServer = async <T>(
  handler: RequestHandler,
  body: (url: string, server: HttpServer) => Promise<T>,
  options?: HttpServerOptions,
) => {
  const server = new HttpServer(scheduler, handler, options);
  try {
    return await body(`http://127.0.0.1:${server.port}`, server);
  } finally {
    server.close();
  }
};

/** Waits until `condition` holds, for at most `frames` frames. */
export const until = (condition: () => boolean, frames: number) =>
  scheduler.spawn(() => {
    for (let i = 0; i < frames && !condition(); i++) {
      coroutine.yield();
    }
    return condition();
  });

/** The error of `p`, or `undefined`. */
export const failure = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return `${e}`;
  }
  return undefined;
};

/** The error that `fn` throws, or `undefined`. */
export const thrown = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return `${e}`;
  }
  return undefined;
};

/** Whether `text` has `part`. */
export const has = (text: string | undefined, part: string) =>
  text !== undefined && string.find(text, part, 1, true)[0] !== undefined;

/** A file of 1 MiB, more than one read of the client and one send of the server. */
export const BIG = (() => {
  const lines: string[] = [];
  for (let i = 0; lines.length * 16 < 1024 * 1024; i++) {
    lines.push(string.format("%015d\n", i));
  }
  return lines.join("");
})();

// the server, against a raw socket

ffi.cdef(`
  typedef struct {
    uint16_t family;
    uint16_t port;
    uint8_t addr[4];
    uint8_t zero[8];
  } test_sockaddr_in;
  int connect(uintptr_t s, const void* addr, int length);
`);

const ws2 = ffi.load("ws2_32.dll");

/** The socket address `127.0.0.1:port`. */
const loopback = (port: number) => {
  const addr = ffi.new("test_sockaddr_in") as any;
  addr.family = 2;
  addr.port = ((port & 0xff) << 8) | (port >> 8);
  addr.addr[0] = 127;
  addr.addr[3] = 1;
  return addr;
};

/**
 * A TCP connection to `127.0.0.1:port`, with what it received so far. The
 * functions of Winsock other than `connect` are the ones that @noita-ts/http
 * declares, and a server started Winsock.
 */
export const connect = (port: number) => {
  const s: number = ws2.socket(2, 1, 6);
  assert(s !== 0xffffffff, `cannot make a socket: ${ws2.WSAGetLastError()}`);
  const addr = loopback(port);
  // the system takes a connection to a listening socket at once, so this
  // blocking call does not wait for the server
  assertEq(ws2.connect(s, addr, ffi.sizeof(addr)), 0, "connect");
  ws2.ioctlsocket(s, 0x8004667e, ffi.new("uint32_t[1]", 1));

  const buffer = ffi.new("char[4096]");
  const connection = {
    received: "",
    closed: false,
    send(text: string) {
      assertEq(ws2.send(s, text, text.length, 0), text.length, "the bytes sent");
    },
    /** Sends what the socket takes now of `text`; the number of bytes, or -1. */
    sendSome(text: string): number {
      return ws2.send(s, text, text.length, 0);
    },
    /** Receives until `done` holds, the server closes, or `frames` pass. */
    receive(done: (received: string) => boolean, frames = 300) {
      return scheduler.spawn(() => {
        for (let i = 0; i < frames && !done(connection.received); i++) {
          while (true) {
            const n = ws2.recv(s, buffer, 4096, 0);
            if (n > 0) {
              connection.received += ffi.string(buffer, n);
            } else {
              // 10035 is WSAEWOULDBLOCK: nothing to read now
              connection.closed ||= n === 0 || ws2.WSAGetLastError() !== 10035;
              break;
            }
          }
          if (connection.closed) {
            break;
          }
          coroutine.yield();
        }
        return connection.received;
      });
    },
    close() {
      ws2.closesocket(s);
    },
    /** Resets the connection: closes it with `SO_LINGER` of 0 seconds. */
    reset() {
      // SOL_SOCKET and SO_LINGER, with `struct linger` { l_onoff, l_linger }
      ws2.setsockopt(s, 0xffff, 0x0080, ffi.new("uint16_t[2]", [1, 0]), 4);
      ws2.closesocket(s);
    },
  };
  return connection;
};

export type Connection = ReturnType<typeof connect>;

/** Runs `body` with a server and a raw connection to it, and closes both. */
export const withConnection = <T>(
  handler: RequestHandler,
  body: (connection: Connection) => Promise<T>,
  options?: HttpServerOptions,
) =>
  withServer(
    handler,
    async (_, server) => {
      const connection = connect(server.port);
      try {
        return await body(connection);
      } finally {
        connection.close();
      }
    },
    options,
  );

/**
 * Sends `request` on a new connection, and gives what came back when the
 * server closed the connection, or after `frames`.
 */
export const exchange = async (
  port: number,
  request: string,
  done: (received: string) => boolean = () => false,
  frames?: number,
) => {
  const connection = connect(port);
  try {
    connection.send(request);
    return await connection.receive(done, frames);
  } finally {
    connection.close();
  }
};

/**
 * Runs `body` with the URL of a raw server at `127.0.0.1`, which answers each
 * connection with what `respond` gives for what the client sent so far (when
 * it gives a string), to test the client against another server than the
 * one of @noita-ts/http. The functions of Winsock are the ones that
 * @noita-ts/http declares.
 */
export const withRawServer = async <T>(
  respond: (received: string) => string | undefined,
  body: (url: string) => Promise<T>,
) => {
  assertEq(ws2.WSAStartup(0x0202, ffi.new("uint8_t[512]")), 0, "WSAStartup");
  const listener: number = ws2.socket(2, 1, 6);
  const addr = loopback(0);
  assertEq(ws2.bind(listener, addr, ffi.sizeof(addr)), 0, "bind");
  assertEq(ws2.listen(listener, 8), 0, "listen");
  ws2.ioctlsocket(listener, 0x8004667e, ffi.new("uint32_t[1]", 1));
  ws2.getsockname(listener, addr, ffi.new("int[1]", ffi.sizeof(addr)));
  const port = ((addr.port & 0xff) << 8) | (addr.port >> 8);

  let done = false;
  const served = scheduler.spawn(() => {
    const buffer = ffi.new("char[4096]");
    while (!done) {
      const s: number = ws2.accept(listener, null, null);
      if (s === 0xffffffff) {
        coroutine.yield();
        continue;
      }
      let received = "";
      while (!done) {
        const n: number = ws2.recv(s, buffer, 4096, 0);
        if (n > 0) {
          received += ffi.string(buffer, n);
          const answer = respond(received);
          if (answer !== undefined) {
            ws2.send(s, answer, answer.length, 0);
            break;
          }
        } else if (n === 0) {
          break;
        } else {
          coroutine.yield();
        }
      }
      ws2.closesocket(s);
    }
  });
  try {
    return await body(`http://127.0.0.1:${port}`);
  } finally {
    done = true;
    await served;
    ws2.closesocket(listener);
    ws2.WSACleanup();
  }
};

// The parts of Winsock (part of Windows, so there is no DLL to ship) that the
// server uses, and its clock. All the sockets are non-blocking, so every call
// returns at once.

import ffi from "@noita-ts/ffi";
import c from "@noita-ts/ffi/schema";
import { describeError } from "../common";

/** An IPv4 socket address (`sockaddr_in`). */
const SockaddrIn = c.declare("NoitaTsHttpSockaddrIn", [
  c.field("family", c.u16),
  // in network byte order
  c.field("port", c.u16),
  c.field("addr", c.u8.arr(4)),
  c.unknown(8, "zero"),
]);
type SockaddrIn = typeof SockaddrIn.type;

// a SOCKET is a uintptr_t
ffi.cdef(`
  int WSAStartup(uint16_t version, void* data);
  int WSACleanup();
  int WSAGetLastError();
  uintptr_t socket(int af, int type, int protocol);
  int bind(uintptr_t s, const void* addr, int length);
  int listen(uintptr_t s, int backlog);
  uintptr_t accept(uintptr_t s, void* addr, int* length);
  int recv(uintptr_t s, char* buffer, int length, int flags);
  int send(uintptr_t s, const char* buffer, int length, int flags);
  int closesocket(uintptr_t s);
  int shutdown(uintptr_t s, int how);
  int ioctlsocket(uintptr_t s, uint32_t command, uint32_t* argument);
  int getsockname(uintptr_t s, void* addr, int* length);
  int setsockopt(uintptr_t s, int level, int name, const void* value, int length);
  int inet_pton(int family, const char* string, void* addr);
  uint64_t GetTickCount64();
`);

// all the calls return at once, so no native code runs in Winsock after the
// Lua state is closed, and the state can free this library handle
const ws2 = ffi.load("ws2_32.dll");

/** Milliseconds since the system started; never wraps. */
export const now = () => tonumber(ffi.C.GetTickCount64())!;

const AF_INET = 2;
const SOCK_STREAM = 1;
const IPPROTO_TCP = 6;
const TCP_NODELAY = 1;
const SOMAXCONN = 0x7fffffff;
const FIONBIO = 0x8004667e;
const SD_SEND = 1;
const INVALID_SOCKET = 0xffffffff;
const SOCKET_ERROR = -1;
const WSAEWOULDBLOCK = 10035;
const WSAECONNRESET = 10054;

/** Names of the common Winsock errors of a listening socket. */
const ERRORS: Record<number, string> = {
  10013: "access denied, for example a reserved port",
  10024: "too many open sockets",
  10048: "address in use",
  10049: "address not available",
  10055: "no buffer space",
};

/** A Winsock error for an error message. */
const describe = (error: number) => describeError("Winsock", error, ERRORS);

/** Starts Winsock; each start needs a {@link cleanup}. */
export const startup = () => {
  const data = ffi.new("uint8_t[512]"); // WSADATA, not read
  const error = ws2.WSAStartup(0x0202, data);
  if (error !== 0) {
    throw new Error(`cannot start Winsock: ${describe(error)}`);
  }
};

/** Ends one {@link startup} of Winsock. */
export const cleanup = () => {
  ws2.WSACleanup();
};

/** Whether the last call failed only because it would block. */
const wouldBlock = () => ws2.WSAGetLastError() === WSAEWOULDBLOCK;

/**
 * Whether a result of `recv` tells that the connection is over: the client
 * closed it (or only its side, see the readme), or an error other than
 * `WSAEWOULDBLOCK`.
 */
const isOver = (n: number) => n === 0 || (n < 0 && !wouldBlock());

/** The size of one `recv`. */
const CHUNK = 64 * 1024;

/**
 * The buffer of all the `recv` calls: each call copies its bytes out before
 * the next one, and no coroutine yields in between.
 */
const buffer = ffi.new("char[?]", CHUNK);

/**
 * The result of a `recv` of `s`: the bytes, `undefined` when there are none
 * now, or `false` when the connection is over.
 */
export const receive = (s: number) => {
  const n: number = ws2.recv(s, buffer, CHUNK, 0);
  if (n > 0) {
    return ffi.string(buffer, n);
  }
  return isOver(n) ? false : undefined;
};

/**
 * Reads the bytes that wait on `s`, and drops them. Gives whether the
 * connection is over.
 */
export const drain = (s: number) => isOver(ws2.recv(s, buffer, CHUNK, 0));

/** A 1 for the options of `ioctlsocket` and `setsockopt`. */
const on = ffi.new("uint32_t[1]", 1);

/**
 * A new connection of the listening socket `s`, `undefined` when there is
 * none now, or the error of `accept`. The connection is non-blocking, as `s`
 * is (`accept` copies the mode, in Windows and in Wine), and sends small
 * writes at once. A connection that the client reset before the `accept` is
 * skipped.
 */
export const accept = (s: number): number | Error | undefined => {
  while (true) {
    const connection: number = ws2.accept(s, null, null);
    if (connection !== INVALID_SOCKET) {
      ws2.setsockopt(connection, IPPROTO_TCP, TCP_NODELAY, on, 4);
      return connection;
    }
    const error = ws2.WSAGetLastError();
    if (error === WSAEWOULDBLOCK) {
      return undefined;
    }
    if (error !== WSAECONNRESET) {
      return new Error(`cannot accept a connection: ${describe(error)}`);
    }
  }
};

/** Closes the socket `s`. */
export const closeSocket = (s: number) => {
  ws2.closesocket(s);
};

/** Closes the sending side of `s`, after the bytes that wait to be sent. */
export const shutdownSend = (s: number) => {
  ws2.shutdown(s, SD_SEND);
};

/**
 * Sends the bytes of `data` from `offset`. Returns the number of the bytes
 * sent, 0 when the socket takes none now, or `false` when the connection is
 * over.
 */
export const send = (s: number, data: string, offset: number) => {
  // a Lua string does not move, and `data` keeps it alive during the call
  const bytes = ffi.cast("const char*", data) as any;
  const n: number = ws2.send(s, bytes + offset, data.length - offset, 0);
  if (n >= 0) {
    return n;
  }
  return wouldBlock() ? 0 : false;
};

const htons = (n: number) => ((n & 0xff) << 8) | ((n >> 8) & 0xff);

/** An IPv4 socket address with `port`; the address is all zeros. */
const sockaddr = (port: number) => {
  const addr: SockaddrIn = ffi.new(SockaddrIn.name);
  addr.family = AF_INET;
  addr.port = htons(port);
  return addr;
};

/** The socket address of `host` (an IPv4 address) with `port`. */
export const parseAddress = (host: string, port: number) => {
  const addr = sockaddr(port);
  if (ws2.inet_pton(AF_INET, host, addr.addr) !== 1) {
    throw new Error(`not an IPv4 address: ${host}`);
  }
  return addr;
};

/**
 * A non-blocking socket that listens at `addr`, and its port (the free port
 * that the system chose, when the port of `addr` is 0).
 */
export const listenAt = (addr: SockaddrIn): [number, number] => {
  const s = ws2.socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
  if (s === INVALID_SOCKET) {
    throw new Error(`cannot make a socket: ${describe(ws2.WSAGetLastError())}`);
  }
  const fail = (what: string): never => {
    const error = ws2.WSAGetLastError();
    ws2.closesocket(s);
    throw new Error(`cannot ${what}: ${describe(error)}`);
  };
  if (ws2.bind(s, addr, SockaddrIn.size) === SOCKET_ERROR) {
    fail(`bind to port ${htons(addr.port)}`);
  }
  if (ws2.listen(s, SOMAXCONN) === SOCKET_ERROR) {
    fail("listen");
  }
  if (ws2.ioctlsocket(s, FIONBIO, on) === SOCKET_ERROR) {
    fail("make the socket non-blocking");
  }
  const bound = sockaddr(0);
  const length = ffi.new("int[1]", SockaddrIn.size);
  if (ws2.getsockname(s, bound, length) === SOCKET_ERROR) {
    fail("get the port");
  }
  return [s, htons(bound.port)];
};

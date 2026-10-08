import Scheduler from "@noita-ts/base/async";
import { assert, assertEq, test } from "@noita-ts/base/test";
import { runServer } from "@noita-ts/pollnet";
import pollnet from "@noita-ts/pollnet/api";
import { HttpClient, HttpResponse } from "@noita-ts/wininet";

/// Requests with WinINet on native threads, against HTTP servers of pollnet in
/// the game. The hosts are IPv4 addresses: WinINet can take `localhost` as
/// `::1`, where pollnet does not listen.

const scheduler = Scheduler.get();
/**
 * A new client. Each test makes its own, as `ffi._release` of the release
 * tests releases every client that exists at that moment.
 */
const client = () => new HttpClient(scheduler, { timeoutMs: 10_000 });

/** A server of static files. */
const FILES = "127.0.0.1:8081";
/** A server that echoes the requests. */
const ECHO = "127.0.0.1:8082";
/** A server that takes the connection and never answers. */
const SILENT = "127.0.0.1:8083";

/** A file of 1 MiB, more than one read of the client. */
const BIG = (() => {
  const lines: string[] = [];
  for (let i = 0; lines.length * 16 < 1024 * 1024; i++) {
    lines.push(string.format("%015d\n", i));
  }
  return lines.join("");
})();

const files = pollnet.serve_http(FILES);
files.add_virtual_file("big.bin", BIG);
scheduler.spawn(() => {
  while (files.poll()[0]) {
    coroutine.yield();
  }
});

runServer(
  scheduler,
  pollnet.serve_dynamic_http(ECHO, false),
  pollnet.wrap_req_handler((req) => ({
    status: "201",
    headers: {
      "X-Method": req.method,
      "X-Path": req.path,
    },
    body: `${req.headers["x-test"]}|${req.body}`,
  })),
);

let silentConnected = false;
let silentClosed = false;
runServer(scheduler, pollnet.listen_tcp(SILENT), (socket) => {
  silentConnected = true;
  while (socket.poll()[0]) {
    coroutine.yield();
  }
  silentClosed = true;
});

/** Waits until `condition` holds, for at most `frames` frames. */
const until = (condition: () => boolean, frames: number) =>
  scheduler.spawn(() => {
    for (let i = 0; i < frames && !condition(); i++) {
      coroutine.yield();
    }
    return condition();
  });

/** The error of `p`, or `undefined`. */
const failure = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return `${e}`;
  }
  return undefined;
};

test("a GET gets the whole file and does not stop the game", async () => {
  let frames = 0;
  let done = false;
  scheduler.spawn(() => {
    while (!done) {
      frames++;
      coroutine.yield();
    }
  });
  const { status, body } = await client().get(`http://${FILES}/big.bin`);
  done = true;
  assertEq(status, 200, "the status");
  assertEq(body.length, BIG.length, "the length");
  assert(body === BIG, "the contents differ");
  // every call on a thread takes a frame or more
  assert(frames > 1, `the game ran ${frames} frames during the request`);
});

test("a GET gives the status of an error", async () => {
  const { status } = await client().get(`http://${FILES}/nope`);
  assertEq(status, 404, "the status");
});

test("a request fails when there is no server", async () => {
  const error = await failure(client().get("http://127.0.0.1:1/"));
  assert(
    error !== undefined && string.find(error, "WinINet error 12029", 1, true)[0] !== undefined,
    `the error: ${error}`,
  );
});

test("a POST sends its headers and body", async () => {
  const response = await client().post(
    `http://${ECHO}/echo`,
    { "X-Test": "a header" },
    "a body\0with a NUL",
  );
  assertEq(response.status, 201, "the status");
  assertEq(response.body, "a header|a body\0with a NUL", "the echo");
});

test("the response headers parse", async () => {
  const response = await client().post(`http://${ECHO}/echo`, "X-Test: a string header\n");
  assertEq(response.body, "a string header|", "the echo");

  // the server of pollnet sends the names in lower case, and only the last
  // value of a header that it is given more than once
  const headers = response.parseHeaders();
  const shown = string.gsub(response.headers, "\n", " | ")[0];
  assertEq(headers["x-method"], "POST", `the method in the headers ${shown}`);
  assertEq(headers["x-path"], "/echo", `the path in the headers ${shown}`);
  assertEq(
    headers["content-length"],
    `${response.body.length}`,
    `the length in the headers ${shown}`,
  );
});

test("a header given more than once parses into an array", () => {
  const response = new HttpResponse(200, "a: 1\nb: 2\na: 3", "");
  const headers = response.parseHeaders();
  const a = headers["a"];
  assert(Array.isArray(a) && a[0] === "1" && a[1] === "3", "the values of a");
  assertEq(headers["b"], "2", "the value of b");
});

test("a header value keeps its own separators", () => {
  const response = new HttpResponse(200, "Link: <a>; rel: b\nbroken\n: c", "");
  const headers = response.parseHeaders();
  assertEq(headers["Link"], "<a>; rel: b", "the value of Link");
  assertEq(headers[""], undefined, "the value without a name");
});

test("a URL that is not http is rejected", async () => {
  const error = await failure(client().get("ftp://127.0.0.1/"));
  assert(error !== undefined, "the request did not fail");
});

test("releasing a client abandons the request that waits", async () => {
  // a client of its own, so that the release does not touch the other tests
  const client = new HttpClient(scheduler, { timeoutMs: 3_000 });
  const result = failure(client.get(`http://${SILENT}/`));
  assert(await until(() => silentConnected, 300), "the request did not connect");
  // let the thread get into the call that waits for the response
  await scheduler.wait(5);

  client._release();
  const error = await result;
  assert(
    error !== undefined && string.find(error, "cancelled", 1, true)[0] !== undefined,
    `the error: ${error}`,
  );

  // Wine does not cancel a call when its handle is closed, so the call ends at
  // the timeout; then the thread sees that the call is abandoned and frees its
  // memory
  assert(await until(() => silentClosed, 600), "the connection was not closed");

  const again = await failure(client.get(`http://${FILES}/nope`));
  assert(again !== undefined, "a released client took a request");
});

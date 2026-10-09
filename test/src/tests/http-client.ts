import { assert, assertEq, test } from "@noita-ts/base/test";
import { HttpClient, HttpResponse } from "@noita-ts/http/client";
import {
  HttpServer,
  type RequestHandler,
  Router,
} from "@noita-ts/http/server";
import {
  BIG,
  client,
  failure,
  has,
  scheduler,
  until,
  withRawServer,
  withServer,
} from "../http-util";

/// The HTTP client of @noita-ts/http, against its HTTP server.

/** Answers with a header of the request. */
const echo: RequestHandler = {
  handle: (req) => ({ status: 201, body: `${req.headers["x-test"]}` }),
};

/**
 * The response of a raw server (another server than the one of
 * @noita-ts/http) to a whole request in `received`: a header and the body.
 */
const echoBody = (received: string) => {
  const [, end] = string.find(received, "\r\n\r\n", 1, true);
  if (end === undefined) {
    return undefined;
  }
  const head = string.lower(string.sub(received, 1, end));
  const length = tonumber(string.match(head, "\ncontent%-length: *(%d+)")[0] ?? "0")!;
  const body = string.sub(received, end + 1);
  if (body.length < length) {
    return undefined;
  }
  const [header] = string.match(received, "\n[Xx]%-[Tt]est: *([^\r\n]*)");
  const text = `${header}|${body}`;
  return `HTTP/1.1 201 Created\r\nContent-Length: ${text.length}\r\nConnection: close\r\n\r\n${text}`;
};

test("a GET gets the whole file and does not stop the game", () =>
  withServer(
    new Router().get("/big.bin", () => ({ body: BIG })),
    async (url) => {
      let frames = 0;
      let done = false;
      scheduler.spawn(() => {
        while (!done) {
          frames++;
          coroutine.yield();
        }
      });
      const { status, body } = await client().get(`${url}/big.bin`);
      done = true;
      assertEq(status, 200, "the status");
      assertEq(body.length, BIG.length, "the length");
      assert(body === BIG, "the contents differ");
      // every call on a thread takes a frame or more
      assert(frames > 1, `the game ran ${frames} frames during the request`);
    },
  ));

test("a GET gives the status of an error", () =>
  withServer(new Router(), async (url) => {
    const { status, body } = await client().get(`${url}/nope`);
    assertEq(status, 404, "the status");
    assertEq(body, "not found\n", "the body");
  }));

test("a request fails when there is no server", async () => {
  const error = await failure(client().get("http://127.0.0.1:1/"));
  assert(has(error, "WinINet error 12029"), `the error: ${error}`);
});

test("a POST sends its headers and body", () =>
  withRawServer(echoBody, async (url) => {
    const response = await client().post(
      `${url}/echo`,
      { "X-Test": "a header" },
      "a body\0with a NUL",
    );
    assertEq(response.status, 201, "the status");
    assertEq(response.body, "a header|a body\0with a NUL", "the echo");
  }));

test("a POST without headers is a form", () =>
  withServer(
    { handle: (req) => ({ body: req.headers["content-type"] }) },
    async (url) => {
      const { body } = await client().post(`${url}/`);
      assertEq(body, "application/x-www-form-urlencoded", "the content type");
    },
  ));

test("the response headers parse", () =>
  withServer(
    { handle: (req) => ({
      headers: {
        "X-Echo": req.headers["x-test"] ?? "",
        "X-Twice": ["1", "2"],
      },
      body: "body",
    }) },
    async (url) => {
      const response = await client().post(url, { "X-Test": "a header" });
      const headers = response.parseHeaders();
      const shown = string.gsub(response.headers, "\n", " | ")[0];
      assertEq(headers["X-Echo"], "a header", `the echo in ${shown}`);
      const twice = headers["X-Twice"];
      assert(
        Array.isArray(twice) && twice[0] === "1" && twice[1] === "2",
        `the repeated header in ${shown}`,
      );
      assertEq(headers["Content-Length"], "4", `the length in ${shown}`);
    },
  ));

test("the response headers parse also without a space after the colon", () =>
  withRawServer(
    (received) =>
      has(received, "\r\n\r\n")
        ? "HTTP/1.1 200 OK\r\nX-Tight:a\r\nX-Wide: \t b\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
        : undefined,
    async (url) => {
      const response = await client().get(url);
      const headers = response.parseHeaders();
      const shown = string.gsub(response.headers, "\n", " | ")[0];
      assertEq(headers["X-Tight"], "a", `the value without a space in ${shown}`);
      assertEq(headers["X-Wide"], "b", `the value after whitespace in ${shown}`);
    },
  ));

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
  assert(
    has(error, "GET ftp://127.0.0.1/: not an http or https URL"),
    `the error: ${error}`,
  );
});

test("a URL with an invalid host or port is rejected", async () => {
  for (const url of [
    "http://user:pass@127.0.0.1/",
    "http://:80/",
    "http://127.0.0.1:80x/",
    "http://127.0.0.1:abc/",
  ]) {
    const error = await failure(client().get(url));
    assert(has(error, `GET ${url}: `), `the error of ${url}: ${error}`);
    assert(!has(error, "WinINet"), `the error of ${url}: ${error}`);
  }
});

test("a redirect is followed", () =>
  withServer(
    new Router()
      .get("/from", () => ({ status: 302, headers: { Location: "/to" } }))
      .get("/to", () => ({ body: "here" })),
    async (url) => {
      const { status, body } = await client().get(`${url}/from`);
      assertEq(status, 200, "the status");
      assertEq(body, "here", "the body");
    },
  ));

test("an HTTPS GET of the internet works", async () => {
  const { status, body } = await client().get("https://necauq.ua/healthcheck");
  assertEq(status, 200, "the status");
  assert(has(body, '"status":"ok"'), `the body: ${body}`);
});

test("closing a client abandons the request that waits", async () => {
  let connected = false;
  let closed = false;
  // a server that takes the request and never answers it
  const server = new HttpServer(scheduler, { handle: async (req) => {
    connected = true;
    await until(() => req.aborted, 60 * 60);
    closed = req.aborted;
    return {};
  } });
  try {
    // a client of its own, so that the close does not touch the other tests
    const client = new HttpClient(scheduler, { timeoutMs: 3_000 });
    const result = failure(client.get(`http://127.0.0.1:${server.port}/`));
    assert(await until(() => connected, 300), "the request did not connect");
    // let the thread get into the call that waits for the response
    await scheduler.wait(5);

    client.close();
    const error = await result;
    assert(has(error, "the client is closed"), `the error: ${error}`);

    // Wine does not cancel a call when its handle is closed, so the call ends
    // at the timeout; then the thread sees that the call is abandoned and
    // frees its memory
    assert(await until(() => closed, 600), "the connection was not closed");

    const again = await failure(client.get(`http://127.0.0.1:${server.port}/`));
    assert(has(again, "the client is closed"), `a request after the close: ${again}`);
  } finally {
    server.close();
  }
});

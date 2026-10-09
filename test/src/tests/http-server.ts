import { assert, assertEq, test } from "@noita-ts/base/test";
import ffi from "@noita-ts/ffi";
import type { HttpResponse } from "@noita-ts/http/client";
import {
  HttpServer,
  type HttpServerOptions,
  plain,
  type RequestHandler,
  Router,
  type ServerRequest,
} from "@noita-ts/http/server";
import {
  BIG,
  client,
  connect,
  exchange,
  failure,
  has,
  scheduler,
  thrown,
  until,
  withConnection,
  withServer,
} from "../http-util";

/// The HTTP server of @noita-ts/http, against its HTTP client, and against a
/// raw socket for what the client cannot send.

/** The status of a response in `received`. */
const statusIn = (received: string) =>
  tonumber(string.match(received, "^HTTP/1%.1 (%d+)")[0]);

/**
 * The status of the response to `request`, which `handler` (or a router)
 * answers, sent on a raw connection, and what came back.
 */
const rawExchange = (
  handler: RequestHandler,
  request: string,
  options?: HttpServerOptions,
) =>
  withServer(
    handler,
    async (_, server): Promise<[number | undefined, string]> => {
      const received = await exchange(server.port, request);
      return [statusIn(received), received];
    },
    options,
  );

/**
 * {@link rawExchange} of a request without a body: `head` is the request
 * line and the headers, each ended by CRLF.
 */
const rawRequest = (
  handler: RequestHandler,
  head: string,
  options?: HttpServerOptions,
) => rawExchange(handler, `${head}\r\n`, options);

/** Answers with the body of the request, between `<` and `>`. */
const echoBody: RequestHandler = { handle: (req) => ({ body: `<${req.body}>` }) };

/** Milliseconds since the system started. */
const ms = () => tonumber(ffi.C.GetTickCount64())!;

/** Waits for `duration` milliseconds. */
const sleep = (duration: number) => {
  const end = ms() + duration;
  return until(() => ms() >= end, 60 * 60);
};

// the router

test("a router picks the handler by the exact path and the method", async () => {
  const router = new Router()
    .get("/a", (req) => ({ body: `get a ${req.query.x}` }))
    .route("delete", "/a", () => ({ body: "delete a" }))
    .get("/b", () => ({ body: "b" }))
    // a path without a leading `/` gets one
    .get("d", () => ({ body: "d" }));
  await withServer(router, async (url) => {
    const http = client();
    assertEq((await http.get(`${url}/a?x=1`)).body, "get a 1", "GET /a");
    assertEq((await http.get(`${url}/b`)).body, "b", "GET /b");
    assertEq((await http.get(`${url}/d`)).body, "d", "GET /d");
    assertEq((await http.get(`${url}/b/`)).status, 404, "GET /b/");
    assertEq((await http.get(`${url}/c`)).status, 404, "GET /c");
  });

  let [status, received] = await rawRequest(router, "DELETE /a HTTP/1.1\r\nHost: 127.0.0.1\r\n");
  assert(status === 200 && has(received, "delete a"), `DELETE /a: ${received}`);
  [status, received] = await rawRequest(router, "PUT /a HTTP/1.1\r\nHost: 127.0.0.1\r\n");
  assertEq(status, 405, `the status of PUT /a in ${received}`);
  assert(has(received, "Allow: DELETE, GET\r\n"), `the Allow header: ${received}`);
});

test("the query is split at the first = of each parameter", async () => {
  const [status, received] = await rawRequest(
    {
      handle: (req) => {
        const keys = Object.keys(req.query);
        keys.sort();
        return { body: `<${keys.map((k) => `${k}=${req.query[k]}`).join("|")}>` };
      },
    },
    "GET /?=a&b&c=d=e&&f%20g=h+i HTTP/1.1\r\nHost: 127.0.0.1\r\n",
  );
  assertEq(status, 200, `the status in ${received}`);
  assert(has(received, "<b=|c=d=e|f g=h i>"), `the query: ${received}`);
});

// CORS

test("only the allowed origins can read the responses", async () => {
  const ok: RequestHandler = { handle: () => ({ body: "ok" }) };
  const fails: RequestHandler = {
    handle: () => {
      throw new Error("expected");
    },
  };
  const options = { allowedOrigins: ["http://a.test"], onError: () => {} };

  let [, received] = await rawRequest(ok, "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nOrigin: http://a.test\r\n", options);
  assert(has(received, "Access-Control-Allow-Origin: http://a.test\r\n"), `an allowed origin: ${received}`);
  assert(has(received, "Vary: Origin\r\n"), `the Vary of an allowed origin: ${received}`);

  [, received] = await rawRequest(
    { handle: () => ({ headers: { vary: "Accept" } }) },
    "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nOrigin: http://a.test\r\n",
    options,
  );
  assert(has(received, "vary: Accept, Origin\r\n"), `the Vary of the handler: ${received}`);

  [, received] = await rawRequest(
    { handle: () => ({ headers: { Vary: ["Accept", "Cookie"] } }) },
    "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n",
    options,
  );
  assert(has(received, "Vary: Accept, Cookie, Origin\r\n"), `the Vary list of the handler: ${received}`);

  [, received] = await rawRequest(
    { handle: () => ({ headers: { Vary: "Accept, origin" } }) },
    "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nOrigin: http://a.test\r\n",
    options,
  );
  assert(has(received, "Vary: Accept, origin\r\n"), `the Vary with Origin: ${received}`);
  assert(!has(received, "Vary: Origin"), `the Vary with Origin: ${received}`);

  [, received] = await rawRequest(
    { handle: () => ({ headers: { Vary: "*" } }) },
    "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nOrigin: http://a.test\r\n",
    options,
  );
  assert(has(received, "Vary: *\r\n"), `the Vary of all: ${received}`);
  assert(!has(received, "Origin\r\n"), `the Vary of all: ${received}`);

  [, received] = await rawRequest(fails, "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nOrigin: http://a.test\r\n", options);
  assertEq(statusIn(received), 500, `the status of an error in ${received}`);
  assert(has(received, "Access-Control-Allow-Origin: http://a.test\r\n"), `an error: ${received}`);

  // the errors of the server itself
  let status: number | undefined;
  [status, received] = await rawRequest(ok, "GET / HTTP/1.1\r\nHost: evil.example\r\nOrigin: http://a.test\r\n", options);
  assertEq(status, 403, `the status of a bad host in ${received}`);
  assert(has(received, "Access-Control-Allow-Origin: http://a.test\r\n"), `a bad host: ${received}`);
  assert(has(received, "Vary: Origin\r\n"), `the Vary of a bad host: ${received}`);
  [status, received] = await rawRequest(ok, "NOT A REQUEST\r\n", options);
  assertEq(status, 400, `the status of a bad request in ${received}`);
  assert(has(received, "Vary: Origin\r\n"), `the Vary of a bad request: ${received}`);

  [, received] = await rawRequest(ok, "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nOrigin: http://b.test\r\n", options);
  assert(!has(received, "Access-Control-"), `another origin: ${received}`);
  assert(has(received, "Vary: Origin\r\n"), `the Vary of another origin: ${received}`);

  [, received] = await rawRequest(ok, "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n", options);
  assert(!has(received, "Access-Control-"), `no origin: ${received}`);
  assert(has(received, "Vary: Origin\r\n"), `the Vary of no origin: ${received}`);

  [, received] = await rawRequest(ok, "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nOrigin: http://c.test\r\n", {
    allowedOrigins: "*",
  });
  assert(has(received, "Access-Control-Allow-Origin: *\r\n"), `all origins: ${received}`);
  assert(!has(received, "Vary"), `the Vary of all origins: ${received}`);

  // the same header without `Origin`, so that a cache can keep one response
  [, received] = await rawRequest(ok, "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n", {
    allowedOrigins: "*",
  });
  assert(has(received, "Access-Control-Allow-Origin: *\r\n"), `all origins, no origin: ${received}`);
  assert(!has(received, "Vary"), `the Vary of all origins, no origin: ${received}`);

  [, received] = await rawRequest(ok, "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nOrigin: http://a.test\r\n");
  assert(!has(received, "Access-Control-"), `no CORS: ${received}`);
  assert(!has(received, "Vary"), `the Vary of no CORS: ${received}`);
});

// the handlers

test("an async handler can wait", () =>
  withServer(
    { handle: async () => {
      const start = GameGetFrameNum();
      await scheduler.wait(10);
      return { body: `${GameGetFrameNum() - start}` };
    } },
    async (url) => {
      const { status, body } = await client().get(url);
      assertEq(status, 200, "the status");
      assert(tonumber(body)! >= 10, `the frames that the handler waited: ${body}`);
    },
  ));

test("a handler that throws gives 500, and the error goes to onError", async () => {
  const errors: string[] = [];
  const onError = (e: unknown, req?: ServerRequest) => {
    errors.push(`${req?.path}: ${e}`);
  };
  await withServer(
    new Router()
      .get("/sync", () => {
        throw new Error("sync");
      })
      .get("/async", async () => {
        await scheduler.wait(2);
        throw new Error("async");
      }),
    async (url) => {
      const http = client();
      assertEq((await http.get(`${url}/sync`)).status, 500, "the sync status");
      assertEq((await http.get(`${url}/async`)).status, 500, "the async status");
    },
    { onError },
  );
  assertEq(errors.length, 2, `the errors: ${errors.join(", ")}`);
  assert(has(errors[0], "/sync") && has(errors[0], "sync"), `the first: ${errors[0]}`);
  assert(has(errors[1], "/async") && has(errors[1], "async"), `the second: ${errors[1]}`);
});

test("an onError that throws does not stop the response", async () => {
  let calls = 0;
  await withServer(
    new Router()
      .get("/throws", () => {
        throw new Error("expected");
      })
      .get("/async", async () => {
        throw new Error("expected");
      }),
    async (url) => {
      const http = client();
      assertEq((await http.get(`${url}/throws`)).status, 500, "the status of a throw");
      assertEq((await http.get(`${url}/async`)).status, 500, "the status of an async throw");
    },
    {
      onError: () => {
        calls++;
        throw new Error("expected in onError");
      },
    },
  );
  assertEq(calls, 2, "the calls of onError");
});

test("plain gives a plain-text response, with the content type of the headers", () => {
  const text = plain(400, "no code");
  assertEq(text.status, 400, "the status");
  assertEq(text.body, "no code\n", "the body");
  assertEq(text.headers!["Content-Type"], "text/plain; charset=utf-8", "the type");
  const html = plain(400, "<b>no</b>", { "content-type": "text/html" });
  assertEq(Object.keys(html.headers!).join(","), "content-type", "the headers");
});

test("a 204 response has no body", () =>
  withServer(
    { handle: () => ({ status: 204, body: "ignored" }) },
    async (url) => {
      const { status, body } = await client().get(url);
      assertEq(status, 204, "the status");
      assertEq(body, "", "the body");
    },
  ));

test("repeated request headers are joined, cookies with semicolons", async () => {
  const [status, received] = await rawRequest(
    { handle: (req) => ({ body: `<${req.headers["cookie"]}|${req.headers["x-two"]}>` }) },
    "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nCookie: a=1\r\nX-Two: 1\r\nCookie: b=2\r\nX-Two: 2\r\n",
  );
  assertEq(status, 200, `the status in ${received}`);
  assert(has(received, "<a=1; b=2|1, 2>"), `the headers: ${received}`);
});

test("a request with bare LF line ends is understood", () =>
  withServer(
    { handle: (req) => ({ body: `<${req.path}|${req.headers["x-a"]}>` }) },
    async (_, server) => {
      const received = await exchange(server.port, "GET /lf HTTP/1.1\nHost: 127.0.0.1\nX-A: b\n\n");
      assertEq(statusIn(received), 200, `the status in ${received}`);
      assert(has(received, "</lf|b>"), `the body: ${received}`);
    },
  ));

// the connections

test("a connection closes after its response", () =>
  withConnection(
    { handle: () => ({ body: "the body" }) },
    async (connection) => {
      connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      const received = await connection.receive(() => false);
      assert(connection.closed, `the connection is open: ${received}`);
      assert(has(received, "Connection: close\r\n"), `the response: ${received}`);
      assert(has(received, "\r\n\r\nthe body"), `the body: ${received}`);
    },
  ));

test("many requests at the same time all get their responses", () =>
  withServer(
    { handle: async (req) => {
      await scheduler.wait(5);
      return { body: req.query.i };
    } },
    async (url) => {
      const requests: Promise<HttpResponse>[] = [];
      for (let i = 0; i < 10; i++) {
        requests.push(client().get(`${url}/?i=${i}`));
      }
      for (let i = 0; i < 10; i++) {
        assertEq((await requests[i]!).body, `${i}`, `the response ${i}`);
      }
    },
  ));

test("connections that the clients reset before the accept are no errors", async () => {
  const errors: string[] = [];
  await withServer(
    { handle: () => ({ body: "ok" }) },
    async (url, server) => {
      // in one frame, so the server can accept them only after the resets
      for (let i = 0; i < 3; i++) {
        connect(server.port).reset();
      }
      assertEq((await client().get(url)).body, "ok", "the body after the resets");
    },
    { onError: (e) => errors.push(`${e}`) },
  );
  assertEq(errors.length, 0, `the errors: ${errors.join(", ")}`);
});

test("a large response arrives whole", () =>
  withServer(
    { handle: () => ({ body: BIG }) },
    async (url) => {
      const { status, body } = await client().get(url);
      assertEq(status, 200, "the status");
      assert(body === BIG, `the body has ${body.length} bytes`);
    },
  ));

// the bodies of the requests

test("the body of a request reaches its handler", () =>
  withServer(
    new Router()
      .post("/echo", (req) => ({ body: `<${req.method} ${req.body}>` }))
      .get("/echo", (req) => ({ body: `<${req.method} ${req.body}>` })),
    async (url) => {
      const http = client();
      let response = await http.post(`${url}/echo`, {}, "a body\0with a NUL");
      assertEq(response.status, 200, "the status of a POST");
      assertEq(response.body, "<POST a body\0with a NUL>", "the body of a POST");
      assertEq((await http.post(`${url}/echo`)).body, "<POST >", "an empty POST");
      assertEq((await http.get(`${url}/echo`)).body, "<GET >", "a GET");

      // the default limit is 1 MiB, the size of BIG
      response = await http.post(`${url}/echo`, {}, BIG);
      assert(response.body === `<POST ${BIG}>`, `the body of 1 MiB has ${response.body.length} bytes`);
      response = await http.post(`${url}/echo`, {}, `${BIG}x`);
      assertEq(response.status, 413, "the status of a body over 1 MiB");
    },
  ));

test("a router routes POST", async () => {
  const router = new Router().post("/form", (req) => ({ body: `<${req.body}>` }));
  let [status, received] = await rawExchange(
    router,
    "POST /form HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: 3\r\n\r\na=b",
  );
  assert(status === 200 && has(received, "<a=b>"), `POST /form: ${received}`);
  [status, received] = await rawRequest(router, "GET /form HTTP/1.1\r\nHost: 127.0.0.1\r\n");
  assertEq(status, 405, `the status of GET /form in ${received}`);
  assert(has(received, "Allow: POST\r\n"), `the Allow header: ${received}`);
});

test("Content-Length gives the length of the body", async () => {
  const start = "POST / HTTP/1.1\r\nHost: 127.0.0.1\r\n";
  for (const [rest, status, body] of [
    ["Content-Length: 5\r\n\r\nhello", 200, "<hello>"],
    ["Content-Length: 005\r\n\r\nhello", 200, "<hello>"],
    ["Content-Length: 0\r\n\r\n", 200, "<>"],
    ["Content-Length: 5\r\nContent-Length: 5\r\n\r\nhello", 200, "<hello>"],
    ["Content-Length: 5 , 5\r\n\r\nhello", 200, "<hello>"],
    // the bytes after the body are dropped
    ["Content-Length: 3\r\n\r\nhello", 200, "<hel>"],
    ["Content-Length: 10\r\n\r\n0123456789", 200, "<0123456789>"],
    ["Content-Length: 11\r\n\r\n0123456789a", 413],
    ["Content-Length: 99999999999999999999\r\n\r\n", 413],
    ["Content-Length: 5, 6\r\n\r\nhello", 400],
    ["Content-Length: -1\r\n\r\n", 400],
    ["Content-Length: 0x5\r\n\r\nhello", 400],
    ["Content-Length:\r\n\r\n", 400],
  ] as const) {
    const [got, received] = await rawExchange(echoBody, `${start}${rest}`, { maxBodyBytes: 10 });
    assertEq(got, status, `the status of ${rest} in ${received}`);
    if (body !== undefined) {
      assert(has(received, `\r\n\r\n${body}`), `the body of ${rest}: ${received}`);
    }
  }
});

test("a chunked body is decoded", async () => {
  const start = "POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nTransfer-Encoding: chunked\r\n\r\n";
  for (const [rest, status, body] of [
    ["5\r\nhello\r\n0\r\n\r\n", 200, "<hello>"],
    // 8 bytes in chunk sizes of hex digits with spaces and extensions
    ["2;a=b;c\r\nab\r\n8 \r\n, chunk!\r\n0\r\nX-Trailer: a\r\nX-B: b\r\n\r\n", 200, "<ab, chunk!>"],
    ["3;a=b;c\r\nabc\r\n8 \r\n, chunk!\r\n0\r\n\r\n", 413],
    ["A\r\n0123456789\r\n0\r\n\r\n", 200, "<0123456789>"],
    ["0005\r\nhe\r\nl\r\n000\r\n\r\n", 200, "<he\r\nl>"],
    ["3\nabc\n0\n\n", 200, "<abc>"],
    ["0\r\n\r\n", 200, "<>"],
    ["a\r\n0123456789\r\n0\r\n\r\n", 200, "<0123456789>"],
    ["a\r\n0123456789\r\n1\r\na\r\n0\r\n\r\n", 413],
    ["FFFFFFFFFF\r\n", 413],
    ["x\r\n", 400],
    ["\r\n", 400],
    ["5 x\r\nhello\r\n0\r\n\r\n", 400],
    ["5\r\nhelloX\r\n0\r\n\r\n", 400],
    // a bare CR in a size line, after the data of a chunk and in a trailer
    ["5;a\rb\r\nhello\r\n0\r\n\r\n", 400],
    ["5\r\nhello\r\r\n0\r\n\r\n", 400],
    ["0\r\nX-T: a\rb\r\n\r\n", 400],
    // one size line that is longer than the limit
    [`1;${string.rep("x", 17 * 1024)}\r\na\r\n0\r\n\r\n`, 413],
    [`0\r\nX-Big: ${string.rep("x", 16 * 1024)}\r\n\r\n`, 431],
    // the chunk extensions and the leading zeros of the sizes count together
    [`1;${string.rep("x", 8 * 1024)}\r\na\r\n0\r\n\r\n`, 200, "<a>"],
    [`${string.rep(`1;${string.rep("x", 8 * 1024)}\r\na\r\n`, 3)}0\r\n\r\n`, 413],
    [`${string.rep("0", 9000)}1\r\na\r\n${string.rep("0", 9000)}\r\n\r\n`, 413],
    [`${string.rep("1\r\na\r\n", 10)}0\r\n\r\n`, 200, "<aaaaaaaaaa>"],
  ] as const) {
    const [got, received] = await rawExchange(echoBody, `${start}${rest}`, { maxBodyBytes: 10 });
    assertEq(got, status, `the status of ${string.sub(rest, 1, 40)} in ${received}`);
    if (body !== undefined) {
      assert(has(received, `\r\n\r\n${body}`), `the body of ${rest}: ${received}`);
    }
  }

  let [status, received] = await rawExchange(
    echoBody,
    "POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nTransfer-Encoding: gzip, chunked\r\n\r\n0\r\n\r\n",
  );
  assertEq(status, 501, `the status of another coding in ${received}`);
  [status, received] = await rawExchange(
    echoBody,
    "POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nTransfer-Encoding: chunked\r\nContent-Length: 5\r\n\r\n0\r\n\r\n",
  );
  assertEq(status, 400, `the status of both codings in ${received}`);
});

test("a body that comes in parts arrives whole", () =>
  withConnection(echoBody, async (connection) => {
    for (const part of [
      "POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nTransfer-Encoding: chunked\r\n\r\n4",
      "\r",
      "\nab",
      "cd\r",
      "\n3;ext\r\nef",
      "g\r\n0\r\nX-T",
      "railer: a\r\n",
      "\r\n",
    ]) {
      connection.send(part);
      await scheduler.wait(2);
    }
    const received = await connection.receive(() => false);
    assertEq(statusIn(received), 200, `the status in ${received}`);
    assert(has(received, "\r\n\r\n<abcdefg>"), `the body: ${received}`);
  }));

test("Expect: 100-continue gets 100 Continue before the body", async () => {
  await withConnection(echoBody, async (connection) => {
    connection.send("POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nExpect: 100-Continue\r\nContent-Length: 5\r\n\r\n");
    const interim = await connection.receive((r) => has(r, "\r\n\r\n"));
    assertEq(interim, "HTTP/1.1 100 Continue\r\n\r\n", "the interim response");
    connection.send("hello");
    const received = await connection.receive(() => false);
    assert(has(received, "\r\n\r\nHTTP/1.1 200 OK\r\n"), `the response: ${received}`);
    assert(has(received, "\r\n\r\n<hello>"), `the body: ${received}`);
  });

  // HTTP/1.0 has no interim responses
  await withConnection(echoBody, async (connection) => {
    connection.send("POST / HTTP/1.0\r\nHost: 127.0.0.1\r\nExpect: 100-continue\r\nContent-Length: 5\r\n\r\n");
    assertEq(await connection.receive(() => false, 30), "", "what HTTP/1.0 got before its body");
    connection.send("hello");
    const received = await connection.receive(() => false);
    assertEq(statusIn(received), 200, `the status of HTTP/1.0 in ${received}`);
  });

  // a body that is here already needs no interim response
  let [status, received] = await rawExchange(
    echoBody,
    "POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nExpect: 100-continue\r\nContent-Length: 5\r\n\r\nhello",
  );
  assert(status === 200 && !has(received, "100 Continue"), `a body that is here: ${received}`);

  // a body that is too large is not sent
  [status, received] = await rawRequest(
    echoBody,
    "POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nExpect: 100-continue\r\nContent-Length: 11\r\n",
    { maxBodyBytes: 10 },
  );
  assert(status === 413 && !has(received, "100 Continue"), `a body that is too large: ${received}`);
});

test("a body can come slowly, with less than the timeout between its parts", () =>
  withConnection(echoBody, async (connection) => {
    connection.send("POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: 3\r\n\r\na");
    // 12 s in all, more than the timeout of 10 s
    await sleep(6000);
    connection.send("b");
    await sleep(6000);
    connection.send("c");
    const received = await connection.receive(() => false);
    assertEq(statusIn(received), 200, `the status in ${received}`);
    assert(has(received, "\r\n\r\n<abc>"), `the body: ${received}`);
  }));

test("a body that stops closes the connection at the timeout", () =>
  withConnection(echoBody, async (connection) => {
    connection.send("POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: 3\r\n\r\na");
    const start = ms();
    const received = await connection.receive(() => false, 60 * 15);
    assert(connection.closed, `the connection is open: ${received}`);
    assertEq(received, "", "what the client got");
    const elapsed = ms() - start;
    assert(elapsed >= 9500, `the connection closed after ${elapsed} ms`);
  }));

test("headers over the limit give 431", () =>
  withServer(
    { handle: () => ({}) },
    async (url) => {
      const { status } = await client().get(url, { "X-Big": string.rep("x", 16 * 1024) });
      assertEq(status, 431, "the status");
    },
  ));

test("a head of 16 KiB is allowed, and one byte more gives 431", async () => {
  const ok: RequestHandler = { handle: () => ({ body: "ok" }) };
  const start = "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-Big: ";
  // the head is the request line and the headers, without the last CRLF
  const head = (size: number) => `${start}${string.rep("x", size - start.length)}\r\n`;
  let [status, received] = await rawRequest(ok, head(16 * 1024));
  assertEq(status, 200, `the status of 16 KiB in ${string.sub(received, 1, 200)}`);
  [status, received] = await rawRequest(ok, head(16 * 1024 + 1));
  assertEq(status, 431, `the status of 16 KiB and a byte in ${string.sub(received, 1, 200)}`);

  // the empty lines before the request line count too
  [status, received] = await rawRequest(ok, `\r\n${head(16 * 1024 - 2)}`);
  assertEq(status, 200, `the status of 16 KiB with an empty line in ${string.sub(received, 1, 200)}`);
  [status, received] = await rawRequest(ok, `\r\n${head(16 * 1024 - 1)}`);
  assertEq(status, 431, `the status of 16 KiB, an empty line and a byte in ${string.sub(received, 1, 200)}`);
  [status, received] = await rawExchange(ok, string.rep("\r\n", 9000));
  assertEq(status, 431, `the status of only empty lines in ${string.sub(received, 1, 200)}`);
});

test("a server answers only the hosts of this computer", async () => {
  const ok: RequestHandler = { handle: () => ({ body: "ok" }) };
  for (const [host, allowed] of [
    ["127.0.0.1:8080", true],
    ["[::1]:8080", false],
    ["localhost:8080", true],
    ["LocalHost.", true],
    ["a.localhost", true],
    ["evil.example", false],
    ["evil.example:8080", false],
    ["localhost.evil.example", false],
    ["a:b:c", false],
    ["evil.example, a.localhost", false],
    ["evil.example a.localhost", false],
    ["localhost:", true],
  ] as const) {
    const [status, received] = await rawRequest(ok, `GET / HTTP/1.1\r\nHost: ${host}\r\n`);
    assertEq(status, allowed ? 200 : 403, `the status of ${host} in ${received}`);
  }
  for (const head of ["GET / HTTP/1.1\r\n", "GET / HTTP/1.0\r\n"]) {
    const [status, received] = await rawRequest(ok, head);
    assertEq(status, 400, `the status without a host of ${head} in ${received}`);
  }
  const [status, received] = await rawRequest(
    ok,
    "GET / HTTP/1.1\r\nHost: evil.example\r\nHost: a.localhost\r\n",
  );
  assertEq(status, 400, `the status with two hosts in ${received}`);
});

test("header values are trimmed, also long runs of whitespace at once", async () => {
  const echo: RequestHandler = { handle: (req) => ({ body: `<${req.headers["x-a"]}>` }) };
  const time = async (head: string) => {
    const start = ms();
    const [status, received] = await rawRequest(echo, head);
    return [ms() - start, status, received] as const;
  };
  let [base, status, received] = await time("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-A: \t v w \t\r\n");
  assertEq(status, 200, `the status in ${received}`);
  assert(has(received, "\r\n\r\n<v w>"), `a trimmed value: ${received}`);
  [, status, received] = await time("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-A:\r\n");
  assert(status === 200 && has(received, "\r\n\r\n<>"), `an empty value: ${received}`);

  // inputs on which simple patterns take quadratic time, about a second
  const run = string.rep(" ", 16 * 1024 - 100);
  for (const [name, head, expected] of [
    ["a value with whitespace inside", `GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-A: a${run}b\r\n`, 200],
    ["a value of only whitespace", `GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-A:${run}\r\n`, 200],
    ["a Content-Length", `GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: 1${run}2\r\n`, 400],
    ["a host", `GET / HTTP/1.1\r\nHost: ${string.rep("1", 16 * 1024 - 100)}!\r\n`, 403],
  ] as const) {
    const [elapsed, got, response] = await time(head);
    assertEq(got, expected, `the status of ${name} in ${string.sub(response, 1, 200)}`);
    assert(elapsed < base + 200, `${name} took ${elapsed} ms, a plain request ${base} ms`);
  }
});

test("a server listens on a given address and port", async () => {
  const first = new HttpServer(scheduler, { handle: () => ({ body: "first" }) }, {
    host: "127.0.0.1",
  });
  try {
    const { body } = await client().get(`http://127.0.0.1:${first.port}/`);
    assertEq(body, "first", "the body");

    const error = thrown(() =>
      new HttpServer(scheduler, { handle: () => ({}) }, { port: first.port }).close(),
    );
    assert(has(error, "cannot bind"), `a second server on the port: ${error}`);
    assert(has(error, "(address in use)"), `a second server on the port: ${error}`);
  } finally {
    first.close();
  }

  const error = thrown(() =>
    new HttpServer(scheduler, { handle: () => ({}) }, { host: "not an address" }).close(),
  );
  assert(has(error, "not an IPv4 address"), `an invalid host: ${error}`);
});

test("a server answers the request that closes it, then takes no more", async () => {
  let server: HttpServer | undefined;
  server = new HttpServer(scheduler, { handle: () => {
    server!.close();
    return { body: "last" };
  } });
  const url = `http://127.0.0.1:${server.port}/`;
  const { body } = await client().get(url);
  assertEq(body, "last", "the body");
  const error = await failure(client().get(url));
  assert(has(error, "WinINet error 12029"), `a request after the close: ${error}`);
});

test("a request that came before the close gets its response, an idle connection closes", async () => {
  const server = new HttpServer(scheduler, { handle: () => ({ body: "in time" }) });
  const busy = connect(server.port);
  const idle = connect(server.port);
  try {
    // the server accepts the connections, and waits for their requests
    await scheduler.wait(5);
    busy.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
    server.close();
    const received = await busy.receive(() => false);
    assertEq(statusIn(received), 200, `the status in ${received}`);
    assert(has(received, "\r\n\r\nin time"), `the body: ${received}`);
    assertEq(await idle.receive(() => false), "", "what the idle connection got");
    assert(idle.closed, "the idle connection is open");
  } finally {
    busy.close();
    idle.close();
  }
});

test("releasing a server closes its connections and frees the port", async () => {
  let started = false;
  const server = new HttpServer(scheduler, { handle: async (req) => {
    started = true;
    await until(() => req.aborted, 600);
    return { body: "too late" };
  } });
  const port = server.port;
  const result = failure(client().get(`http://127.0.0.1:${port}/`));
  assert(await until(() => started, 300), "the request did not arrive");
  server._release();
  const error = await result;
  assert(has(error, "WinINet error"), `the error: ${error}`);

  const again = new HttpServer(scheduler, { handle: () => ({ body: "again" }) }, { port });
  try {
    const { body } = await client().get(`http://127.0.0.1:${port}/`);
    assertEq(body, "again", "the body of a new server on the port");
  } finally {
    again.close();
  }
});

// the server, against a raw socket

test("an HTTP/1.0 request gets its response", async () => {
  const [status, received] = await rawRequest({ handle: () => ({ body: "old" }) }, "GET / HTTP/1.0\r\nHost: 127.0.0.1\r\n");
  assertEq(status, 200, `the status in ${received}`);
  assert(has(received, "\r\n\r\nold"), `the body: ${received}`);
});

test("a malformed request gets 400 and the connection closes", async () => {
  for (const head of ["NOT A REQUEST\r\n", "GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-A: a\rb\r\n", "GET http://127.0.0.1/ HTTP/1.1\r\nHost: 127.0.0.1\r\n", "GET * HTTP/1.1\r\nHost: 127.0.0.1\r\n", "\rGET / HTTP/1.1\r\nHost: 127.0.0.1\r\n", "\r\n\r\rGET / HTTP/1.1\r\nHost: 127.0.0.1\r\n"]) {
    const [status, received] = await rawRequest({ handle: () => ({}) }, head);
    assertEq(status, 400, `the status of ${head} in ${received}`);
  }
});

test("an idle connection closes at the timeout", () =>
  withConnection(
    { handle: () => ({}) },
    async (connection) => {
      const start = ms();
      // the timeout is 10 seconds
      await connection.receive(() => false, 60 * 15);
      assert(connection.closed, "the connection is open");
      const elapsed = ms() - start;
      assert(elapsed >= 9500, `the connection closed after ${elapsed} ms`);
    },
  ));

test("a head that comes a byte in each frame closes the connection at the timeout", () =>
  withConnection(
    { handle: () => ({}) },
    async (connection) => {
      connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-Slow: ");
      const start = ms();
      // the timeout is 10 seconds; the bytes of 15 s are far below 16 KiB
      const received = await connection.receive(() => {
        connection.sendSome("a");
        return false;
      }, 60 * 15);
      assert(connection.closed, `the connection is open: ${received}`);
      assertEq(received, "", "what the client got");
      const elapsed = ms() - start;
      assert(elapsed >= 9500, `the connection closed after ${elapsed} ms`);
    },
  ));

test("an async handler sees that the client went away", async () => {
  let aborted = false;
  let started = false;
  await withServer(
    { handle: async (req) => {
      started = true;
      await until(() => req.aborted, 300);
      aborted = req.aborted;
      return {};
    } },
    async (_, server) => {
      const connection = connect(server.port);
      connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      assert(await until(() => started, 300), "the request did not arrive");
      connection.close();
      assert(await until(() => aborted, 300), "the handler did not see it");
    },
  );
});

test("an async handler sees a client that sent more bytes and went away", async () => {
  let aborted = false;
  let started = false;
  await withServer(
    { handle: async (req) => {
      started = true;
      await until(() => req.aborted, 300);
      aborted = req.aborted;
      return {};
    } },
    async (_, server) => {
      const connection = connect(server.port);
      connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      assert(await until(() => started, 300), "the request did not arrive");
      // bytes that the server does not read must not hide the close
      connection.send("more");
      connection.close();
      assert(await until(() => aborted, 300), "the handler did not see it");
    },
  );
});

test("a client that still sends its body gets the 413", () =>
  withConnection(
    { handle: () => ({}) },
    async (connection) => {
      connection.send("POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: 4194304\r\n\r\n");
      // the body goes on while the server answers
      const chunk = string.rep("x", 16 * 1024);
      const sending = scheduler.spawn(() => {
        for (let i = 0; i < 60 && !connection.closed; i++) {
          connection.sendSome(chunk);
          coroutine.yield();
        }
      });
      const received = await connection.receive(() => false);
      await sending;
      assertEq(statusIn(received), 413, `the status in ${received}`);
      assert(connection.closed, `the connection is open: ${received}`);
    },
  ));

test("a server does not wait for a handler whose client went away", async () => {
  let started = false;
  const server = new HttpServer(scheduler, { handle: () => {
    started = true;
    // a promise that never settles
    return new Promise(() => {});
  } });
  const connection = connect(server.port);
  connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
  assert(await until(() => started, 300), "the request did not arrive");
  connection.close();
  server.close();
  // the server is released when its last connection is gone
  assert(
    await until(() => (server as any).released === true, 300),
    "the server waits for the handler",
  );
});

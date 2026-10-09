# @noita-ts/http

HTTP for unsafe [noita-ts](https://github.com/necauqua/noita-ts) mods through
the LuaJIT FFI, without a DLL to ship:

- `HttpClient` uses WinINet, and runs its blocking calls on native threads, so
  the game does not stop while a request waits.
- `HttpServer` is an HTTP/1.1 server on non-blocking Winsock sockets, which a
  scheduler polls, so it needs no threads at all.

WinINet and Winsock are part of Windows (and of Wine).

The client and the server are separate entry points,
`@noita-ts/http/client` and `@noita-ts/http/server`, so a mod that uses only
one of them does not include the other. Both export the shared types
`HeaderMap` and `Scheduler`.

## Why

With this package, a mod that only does HTTP does not need the pollnet DLL
of `@noita-ts/pollnet` (3.5 MB): this package is only Lua. Use pollnet
when you need its other parts, such as WebSockets or TCP.

There is also a bug that WinINet does not have: in Wine (Proton), the HTTPS of
pollnet (rust `schannel` on the `schannel` of Wine) stops in a response that
has more than one TLS record (24 KB is enough). It waits until the server
closes the connection (65 s for nginx), and then it often fails. With WinINet,
a 1.6 MB download takes about 1 s, with the game running.

## The client

The API is the same as `HttpClient` of `@noita-ts/pollnet`, except that the
headers of a request are only a map, so a mod can usually change only the
import (to `@noita-ts/http/client`):

```ts
import Scheduler from "@noita-ts/base/async";
import { HttpClient } from "@noita-ts/http/client";

const http = new HttpClient(Scheduler.get());

const response = await http.get("https://example.com/", { Accept: "text/html" });
print(response.status, response.parseHeaders()["Content-Type"]);

await http.post("https://example.com/api", { "Content-Type": "application/json" }, "{}");
```

- `new HttpClient(scheduler, options?)`: `scheduler` is anything with
  `spawn` (a `Scheduler` of `@noita-ts/base/async`). The options are
  `userAgent` (default `noita-ts/http`) and `timeoutMs`, the timeout of a
  connection, of a send and of a receive (an integer from 1 to 4294967295,
  default 30 s). A client keeps a
  WinINet session until `client.close()` or until the Lua state is closed,
  so make one and keep it. `close()` rejects the requests that wait, and
  the client takes no requests after it (their error is `the client is
  closed`).
- `get(url, headers?)` and `post(url, headers?, body?)` resolve to an
  `HttpResponse` with `status`, `headers` (`Key: value` lines separated by
  `\n`), `body` and `parseHeaders()`. The headers of a request are a map
  (an array value sends the header more than once). Without
  headers, a POST sends `content-type: application/x-www-form-urlencoded`, as
  in pollnet.
- An error rejects the promise with an `Error` that starts with the method
  and the URL. An error of WinINet also has the WinINet error, for example
  `GET http://127.0.0.1:1/: cannot send the request: WinINet error 12029 (cannot connect)`.
  A connection that closes before the response is error 12152 (invalid
  server response).
- Redirects are followed, also between http and https.

### Limits of the client

- Only `http` and `https` URLs with a host name or an IPv4 address, and
  without user info (`user:pass@`). Use `127.0.0.1`, not `localhost`:
  WinINet can take `localhost` as `::1`.
- The whole body is kept in memory, as one string.
- Each blocking call starts a new native thread; the Lua side looks at the
  result once per frame, so every request takes at least a few frames.
- When the Lua state is closed (for example a new game starts), every client
  closes, as with `close()`: it closes its WinINet handles and frees its
  memory. A request that waits at
  that moment cannot be stopped in Wine: its thread runs until the call
  returns or times out, and then frees the memory of the call itself. Windows
  cancels such a call when its handle is closed.
- Wine gives a timeout as WinINet error 12030 (connection aborted), not 12002.

## The server

`HttpServer` is a small HTTP/1.1 server for a mod: for example, the target
of an OAuth redirect on a free port, or a stream of game data for a browser
source of OBS. Each connection has one request, and closes after its
response.

A server for one redirect, on a free port:

```ts
import Scheduler from "@noita-ts/base/async";
import { HttpServer, Router } from "@noita-ts/http/server";

const scheduler = Scheduler.get();

const login = new HttpServer(
  scheduler,
  new Router().get("/callback", (req) => {
    print(`the code: ${req.query.code}`);
    // the server still sends this response, then stops
    login.close();
    return {
      headers: { "Content-Type": "text/html" },
      body: "<p>You can close this page.</p>",
    };
  }),
);
print(`the redirect target: http://localhost:${login.port}/callback`);
```

A server at a fixed port for a browser source of OBS: a page, and the
game data as server-sent events, which the page gets from the same origin:

```ts
import { EventChannel } from "@noita-ts/http/server";

const page = `<div id="deaths"></div>
<script>
  new EventSource("/events").onmessage = (e) => {
    deaths.textContent = JSON.parse(e.data).deaths;
  };
</script>`;

const data = () => JSON.stringify({ deaths: deathCount() });
const channel = new EventChannel();
new HttpServer(
  scheduler,
  new Router()
    .get("/", () => ({ headers: { "Content-Type": "text/html" }, body: page }))
    .get("/events", () => {
      const stream = channel.open();
      stream.send(data()); // the first event at once
      return stream.response();
    }),
  { port: 5435 },
);

// for example every 3 seconds
if (channel.size() > 0) {
  channel.send(data());
}
```

- `new HttpServer(scheduler, handler, options?)` listens at once (it throws
  when it cannot, for example when another program has the port). `handler`
  is a `RequestHandler`: anything with a `handle(req)` method, such as a
  `Router`, or `{ handle: (req) => ({ body: "hi" }) }`. Write `handle`
  there (as an arrow function or a method): mods compile with
  `noImplicitSelf`, so a function that is declared elsewhere has no `self`,
  and TSTL does not take it as a method. The options are:
  - `host`: an IPv4 address to listen on, by default `127.0.0.1`; for
    example `0.0.0.0` for the LAN (then Windows can ask the player to
    let the game through its firewall). A client in the LAN must use the
    IPv4 address of the computer, not its name (see [Security](#security)).
    The server has no IPv6. When
    `localhost` is `::1`, browsers try `127.0.0.1` too, but some other
    programs do not: give those `127.0.0.1`.
  - `port`: by default 0, a free port (else from 1 to 65535);
    `server.port` is the port that the server got.
  - `maxBodyBytes`: the most bytes of the body of a request (decoded,
    for a chunked body), by default 1 MiB; a larger body gets 413.
  - `allowedOrigins`: the origins whose pages can read the responses (see
    [Security](#security)). An origin of the list is `scheme://host` or
    `scheme://host:port`, in lower case and without a path (as browsers send
    it).
  - `onError(error, req?)`: gets the errors of the handlers (the client then
    gets a 500 response), of the `onClose` functions of streams, and of the
    server itself. By default, it prints them. When it throws, both errors
    are printed.
- `handle` gets a `ServerRequest` with `method`, `target` (as sent), `path`
  (not decoded), `query` (decoded), `headers` (lower-case names; the values
  of a repeated header are joined with `, `, and with `; ` for `cookie`),
  `body` (an empty string when the request has none) and `aborted`. It returns a `ServerResponse` (`status`, an integer from
  200 to 999, default 200; `headers`, an array value sends the header once
  for each value; `body`, a string or an `EventStream`), or a promise of
  one.
- While an async handler waits, the server looks whether the client closed
  the connection. Then it sets `req.aborted`, stops to wait for the handler,
  and does not send the response. A client that closes only its sending side
  after the request (`shutdown`) looks the same as a client that is gone, so
  it gets no response either.
- `server.close()` stops listening, and ends its event streams. The open
  connections still get the response of the request that they have, and
  then close. A connection whose async handler never gives a response stays
  open until the client closes it, or until the Lua state is closed.
- When the Lua state is closed, the server closes all of its sockets.

A `Router` picks a function (a `RouteHandler`, which gets the request like
`handle`) by the method and the exact path (without the query, not
decoded): `route(method, path, handler)`, `get` and `post` (a path without a
leading `/` gets one). An unknown path gets
404, and a known path with another method gets 405, with an `Allow` header.

`plain(status, text, headers?)` is a plain-text response, for example
`plain(400, "no code")`: `Content-Type: text/plain; charset=utf-8` (when
`headers` has no `Content-Type`), and `text` and a line break as the body.

### Security

- The server answers only the requests whose `Host` is an IPv4 address,
  `localhost` or a name that ends with `.localhost`; others get 403, and a
  request without `Host`, or with more than one, gets 400 (also in
  HTTP/1.0). This
  stops DNS rebinding: a web page at a domain whose address changes to
  `127.0.0.1` cannot use that domain to read the responses.
- Without `allowedOrigins`, the pages of other origins cannot read the
  responses. With `"*"`, all the responses get
  `Access-Control-Allow-Origin: *`. With a list of origins (for example
  `["http://localhost:5173"]`), the responses to a request with an allowed
  `Origin` get `Access-Control-Allow-Origin`, and all the responses (also
  the errors of the server, such as 403) get `Vary: Origin` (added to a
  `Vary` of the handler), so that a cache does not give the response for one
  origin to another. The server does not answer CORS preflight requests,
  so only simple requests work across origins: an `EventSource`, a `fetch`
  GET, or a POST of a form or of `text/plain` (not of JSON). A page that the
  server serves itself has the same origin, and needs none of this.
- Any web page can still send GET requests to the server, for example with
  an image, and POST requests, with a form, even when it cannot read the
  responses. So a handler that
  changes something in the game must not trust such a request; the OAuth
  redirect, for example, checks its `state` parameter.

### HTTP of the server

- The server sets `Content-Length` and `Connection: close` itself (it drops
  these headers and `Transfer-Encoding` from the headers of the handler), and
  closes the connection after each response. 204 and 304 responses have no
  body.
- After a response, the server closes its sending side, and waits up to
  2 s for the client to close the connection. It drops what the client
  sends in that time. Thus a client that still sends (for example the body
  of a request that gets 413) gets the whole response, and not a reset of
  the connection.
- The server sends the status of a response, and the server and the client
  send the names and the values of headers, without checks.
- The request line and the headers can have 16 KiB (else 431). Empty
  lines before the request line are skipped, but they count too. A client
  can take 10 s to send them, it must send bytes of its body at least every
  10 s, and it must take bytes of the response at least every 10 s.
- The body of a request is read before the handler gets the request, and
  is kept in memory. After the bytes that come with the head, the server
  reads at most 64 KiB of it in each poll, so that a fast client cannot
  stop the game. Its length comes from `Content-Length`, or it is
  chunked (`Transfer-Encoding: chunked`): the server decodes it, and drops
  the chunk extensions (16 KiB at most together, else 413) and the trailer
  fields (16 KiB at most together, else 431).
  Other transfer codings get 501, and a request with both
  `Content-Length` and `Transfer-Encoding` gets 400.
- To a request with `Expect: 100-continue` (HTTP/1.1) whose body did not
  come yet, the server sends `100 Continue` before it reads the body, so
  the client does not wait. A request whose `Content-Length` is too large
  gets 413 instead.
- A bare LF ends a line of a request too, not only CRLF. A bare CR makes
  the request invalid (400): in the head, in the empty lines before it, and
  in the lines of a chunked body.
- A request target must be a path (origin form); other targets get 400.
- A response with a string body is kept in memory.

### Server-sent events

`EventStream` is a response body of server-sent events (SSE), for the
`EventSource` of a browser (for example in a browser source of OBS):

```ts
import { EventStream } from "@noita-ts/http/server";

router.get("/events", () => {
  const events = new EventStream();
  events.send({ event: "hello", data: "world" });
  // ...later, also from other code
  events.send("more");
  return events.response();
});
```

```js
// in the browser
new EventSource("http://localhost:8080/events")
  .addEventListener("hello", (e) => console.log(e.data));
```

- `send(event)`: an event is `{ event?, data }` (`event` is its type,
  `message` by default), or a string for its data. Each line of the data
  becomes a `data:` line. The server
  sends the events once per poll.
- `response(headers?)` is the response that starts the stream: status 200,
  `headers`, and `Content-Type: text/event-stream` and
  `Cache-Control: no-cache` when `headers` does not have them (in any case
  of the name).
- `send` returns false, and sends nothing, when the stream is closed: the
  handler ended it with `end()`, the client went away, the server closed
  (which ends its streams; a stream of an async handler ends when the
  handler gives it) or was released, or more than 1 MiB waited to be
  sent to a slow client. After the end, the server closes the connection.
- `isClosed()` is true when the stream takes no more events, and `onClose(fn)`
  calls `fn` once when the response is over (at once when it is over
  already; then its errors are printed). A stream that no server sends
  calls `fn` when more than 1 MiB waits, as it can then never be sent;
  thus never after `end()`, as it then takes no more events.
- A stream is the body of one response only: the server answers another
  response with the same stream with 500 (and the error goes to `onError`).

`EventChannel` keeps the open streams of many clients (for example of a
browser that reconnects), and sends events to all of them:

- `channel.open()` makes a stream; return its `response()` from a
  handler. The channel forgets the stream when it closes, also when the
  handler ends it. A stream that no server sends (for example when the
  handler returns another response) closes, and calls its `onClose`
  functions, when 1 MiB of events waits for it.
- `channel.send(event)` sends an event to all the open streams and returns
  their number; `channel.size()` is that number; `channel.close()` ends all
  the streams and forgets them.

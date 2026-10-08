# @noita-ts/wininet

An HTTP client for unsafe [noita-ts](https://github.com/necauqua/noita-ts) mods
that uses WinINet through the LuaJIT FFI. WinINet is part of Windows (and of
Wine), so the package ships no DLL. The blocking WinINet calls run on native
threads, so the game does not stop while a request waits.

## Why

A mod that only makes HTTP requests does not have to ship the pollnet DLL of
`@noita-ts/pollnet` (3.5 MB) any more. This package is only Lua, and WinINet is
already on every Windows (and in Wine). Use pollnet when you need its other
parts, such as WebSockets, TCP or servers.

There is also a bug that WinINet does not have: in Wine (Proton), the HTTPS of
pollnet (rust `schannel` on the `schannel` of Wine) stops in a response that
has more than one TLS record (24 KB is enough). It waits until the server
closes the connection (65 s for nginx), and then it often fails. With WinINet,
a 1.6 MB download takes about 1 s, with the game running.

## Usage

The API is the same as `HttpClient` of `@noita-ts/pollnet`, so a mod can change
only the import:

```ts
import Scheduler from "@noita-ts/base/async";
import { HttpClient } from "@noita-ts/wininet";

const http = new HttpClient(Scheduler.get());

const response = await http.get("https://example.com/", { Accept: "text/html" });
print(response.status, response.parseHeaders()["Content-Type"]);

await http.post("https://example.com/api", { "Content-Type": "application/json" }, "{}");
```

- `new HttpClient(scheduler, options?)`: `scheduler` is anything with
  `spawn` (a `Scheduler` of `@noita-ts/base/async`). The options are
  `userAgent` (default `noita-ts/wininet`) and `timeoutMs`, the timeout of a
  connection, of a send and of a receive (default 30 s). A client keeps a
  WinINet session until the Lua state is closed, so make one and keep it.
- `get(url, headers?)` and `post(url, headers?, body?)` resolve to an
  `HttpResponse` with `status`, `headers` (`Key: value` lines separated by
  `\n`), `body` and `parseHeaders()`. Headers are a map (an array value
  sends the header more than once) or a string of `\n`-separated lines. Without
  headers, a POST sends `content-type: application/x-www-form-urlencoded`, as
  in pollnet.
- An error of WinINet rejects the promise with an `Error` that has the method,
  the URL and the WinINet error, for example
  `GET http://127.0.0.1:1/: cannot send the request: WinINet error 12029 (cannot connect)`.
- Redirects are followed, also between http and https.

## Limits

- Only `http` and `https` URLs with a host name or an IPv4 address. Use
  `127.0.0.1`, not `localhost`: WinINet can take `localhost` as `::1`.
- The whole body is kept in memory, as one string.
- Each blocking call starts a new native thread; the Lua side looks at the
  result once per frame, so every request takes at least a few frames.
- When the Lua state is closed (for example a new game starts), every client
  closes its WinINet handles and frees its memory. A request that waits at
  that moment cannot be stopped in Wine: its thread runs until the call
  returns or times out, and then frees the memory of the call itself. Windows
  cancels such a call when its handle is closed.
- Wine gives a timeout as WinINet error 12030 (connection aborted), not 12002.

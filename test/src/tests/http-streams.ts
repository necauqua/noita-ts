import { assert, assertEq, test } from "@noita-ts/base/test";
import { EventChannel, EventStream, HttpServer } from "@noita-ts/http/server";
import {
  client,
  connect,
  has,
  scheduler,
  thrown,
  until,
  withConnection,
  withServer,
} from "../http-util";

/// The server-sent events of @noita-ts/http.

test("an event stream sends the events as they come, then closes", async () => {
  let events: EventStream | undefined;
  let closed = false;
  await withConnection(
    { handle: () => {
      events = new EventStream();
      events.onClose(() => {
        closed = true;
      });
      return events.response({ "X-Extra": "yes" });
    } },
    async (connection) => {
      connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      let received = await connection.receive((r) => has(r, "\r\n\r\n"));
      assert(has(received, "Content-Type: text/event-stream"), `the head: ${received}`);
      assert(has(received, "X-Extra: yes"), `the head: ${received}`);
      assert(!has(received, "Content-Length"), `the head: ${received}`);
      assert(!has(received, "Transfer-Encoding"), `the head: ${received}`);

      assert(events!.send("one"), "the first send");
      received = await connection.receive((r) => has(r, "data: one\n\n"));
      assert(has(received, "\r\n\r\ndata: one\n\n"), `the first event: ${received}`);

      events!.send({ event: "two", data: "a\nb\r\nc" });
      received = await connection.receive((r) => has(r, "data: c\n\n"));
      assert(has(received, "event: two\ndata: a\ndata: b\ndata: c\n\n"), `the second event: ${received}`);
      assert(!closed, "the stream closed early");

      events!.end();
      assert(!events!.send("late"), "a send after the end");
      received = await connection.receive(() => false);
      assert(connection.closed, `the connection is open: ${received}`);
      assert(!has(received, "late"), `the late event: ${received}`);
      assert(await until(() => closed, 60), "onClose was not called");
    },
  );
});

test("an event stream of many events arrives whole", () =>
  withServer(
    { handle: () => {
      const events = new EventStream();
      scheduler.spawn(() => {
        for (let i = 0; i < 100; i++) {
          coroutine.yield();
          events.send(string.rep(`${i % 10}`, 1000));
        }
        events.end();
      });
      return events.response();
    } },
    async (url) => {
      const { body } = await client().get(url);
      const expected: string[] = [];
      for (let i = 0; i < 100; i++) {
        expected.push(`data: ${string.rep(`${i % 10}`, 1000)}\n\n`);
      }
      assert(body === expected.join(""), `the body has ${body.length} bytes`);
    },
  ));

test("closing the server ends its streams", async () => {
  let closed = false;
  let events: EventStream | undefined;
  const server = new HttpServer(scheduler, { handle: () => {
    events = new EventStream();
    events.onClose(() => {
      closed = true;
    });
    events.send("start");
    return events.response();
  } });
  const connection = connect(server.port);
  try {
    connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
    await connection.receive((r) => has(r, "data: start"));
    server.close();
    assert(events!.isClosed(), "the stream is open after the close");
    assert(!events!.send("late"), "a send after the close");
    const received = await connection.receive(() => false);
    assert(!has(received, "late"), `the late event: ${received}`);
    assert(connection.closed, "the connection is open");
    assert(closed, "onClose was not called");
  } finally {
    connection.close();
  }
});

test("a stream that buffers too much closes the connection", async () => {
  let events: EventStream | undefined;
  let closed = false;
  await withConnection(
    { handle: () => {
      events = new EventStream();
      events.onClose(() => {
        closed = true;
      });
      return events.response();
    } },
    async (connection) => {
      connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      await connection.receive((r) => has(r, "\r\n\r\n"));
      // more than 1 MiB
      assert(!events!.send(string.rep("x", 1024 * 1024)), "the send of too much");
      assert(events!.isClosed(), "the stream is open");
      await connection.receive(() => false);
      assert(connection.closed, "the connection is open");
      assert(closed, "onClose was not called");
    },
  );
});

test("an overflow stops a write to a client that reads nothing", async () => {
  let events: EventStream | undefined;
  let closed = false;
  await withConnection(
    { handle: () => {
      events = new EventStream();
      events.onClose(() => {
        closed = true;
      });
      return events.response();
    } },
    async (connection) => {
      connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      await connection.receive((r) => has(r, "\r\n\r\n"));
      // the client reads no more, so when the socket buffers are full, a
      // write waits for it, and the sends then fill the limit
      const chunk = string.rep("x", 600 * 1024);
      for (let sends = 0; events!.send(chunk); sends++) {
        assert(sends < 50, "the stream takes everything");
        await scheduler.wait(5);
      }
      // much less than the timeout of a write (10 seconds)
      assert(await until(() => closed, 120), "the stream did not close");
    },
  );
});

test("the text that the server still writes counts against the limit", () => {
  const events = new EventStream();
  const half = string.rep("x", 600 * 1024);
  assert(events.send(half), "the first send");
  // the server takes the text, and writes it to a slow client
  events._take();
  assert(!events.send(half), "a send while the first one is written");
  assert(events.isClosed(), "the stream is open");

  const other = new EventStream();
  assert(other.send(half), "the first send of another stream");
  const [text] = other._take();
  other._sent(text.length);
  assert(other.send(half), "a send after the first one is written");
});

test("a 204 response with a stream sends no events", async () => {
  let closed = false;
  await withConnection(
    { handle: () => {
      const events = new EventStream();
      events.onClose(() => {
        closed = true;
      });
      events.send("never sent");
      return { ...events.response(), status: 204 };
    } },
    async (connection) => {
      connection.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      const received = await connection.receive(() => false);
      assert(has(received, "HTTP/1.1 204"), `the response: ${received}`);
      assert(!has(received, "never sent"), `the response: ${received}`);
      assert(closed, "onClose was not called");
    },
  );
});

test("a stream is the body of one response only, also after its end", async () => {
  const events = new EventStream();
  const errors: string[] = [];
  await withServer(
    { handle: () => events.response() },
    async (_, server) => {
      const first = connect(server.port);
      first.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      await first.receive((r) => has(r, "\r\n\r\n"));

      // while the first response sends the stream
      const second = connect(server.port);
      second.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      let received = await second.receive(() => false);
      assert(has(received, "HTTP/1.1 500"), `the second response: ${received}`);
      assert(second.closed, "the second connection is open");
      second.close();
      assert(!events.isClosed(), "the stream closed");
      assert(events.send("to the first"), "the send after the second response");
      received = await first.receive((r) => has(r, "data: to the first"));
      assert(has(received, "data: to the first"), `the first response: ${received}`);

      first.close();
      assert(await until(() => events.isClosed(), 300), "the stream is open");

      // after the end of the first response
      const third = connect(server.port);
      third.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      received = await third.receive(() => false);
      assert(has(received, "HTTP/1.1 500"), `the third response: ${received}`);
      assert(third.closed, "the third connection is open");
      third.close();
    },
    { onError: (e) => errors.push(`${e}`) },
  );
  assertEq(errors.length, 2, `the errors: ${errors.join(", ")}`);
  assert(has(errors[0], "another response"), `the first error: ${errors[0]}`);
});

test("the headers of a stream response replace its defaults in any case", () => {
  const headers = new EventStream().response({
    "content-type": "text/event-stream; charset=utf-8",
  }).headers!;
  const names = Object.keys(headers);
  names.sort();
  assertEq(names.join(","), "Cache-Control,content-type", "the names");
  assertEq(headers["content-type"], "text/event-stream; charset=utf-8", "the type");
});

test("onClose of a finished stream calls the function at once, and catches its error", () => {
  const events = new EventStream();
  events._finish(() => {});
  let called = false;
  const error = thrown(() =>
    events.onClose(() => {
      called = true;
      throw new Error("expected");
    }),
  );
  assert(called, "onClose was not called");
  assertEq(error, undefined, "the error of onClose");
});

// channels

test("a channel sends to all its streams, and forgets the ones that close", async () => {
  const channel = new EventChannel();
  await withServer(
    { handle: () => channel.open().response() },
    async (_, server) => {
      const a = connect(server.port);
      const b = connect(server.port);
      a.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      b.send("GET / HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n");
      assert(await until(() => channel.size() === 2, 300), `the streams: ${channel.size()}`);

      assertEq(channel.send("to all"), 2, "the streams of the first event");
      assert(has(await a.receive((r) => has(r, "data: to all")), "data: to all"), "a");
      assert(has(await b.receive((r) => has(r, "data: to all")), "data: to all"), "b");

      a.close();
      assert(await until(() => channel.size() === 1, 300), `the streams: ${channel.size()}`);
      assertEq(channel.send("to b"), 1, "the streams of the second event");
      assert(has(await b.receive((r) => has(r, "data: to b")), "data: to b"), "b again");

      channel.close();
      assertEq(channel.size(), 0, "the streams after close");
      await b.receive(() => false);
      assert(b.closed, "the stream of b is open");
      b.close();
    },
  );
});

test("a channel forgets a stream when it ends", () => {
  const channel = new EventChannel();
  const stream = channel.open();
  channel.open();
  stream.end();
  assertEq(channel.size(), 1, "the streams after the end");
  assertEq(channel.send("an event"), 1, "the streams of an event");
  channel.close();
  assertEq(channel.size(), 0, "the streams after close");
});

test("a channel forgets the streams that no server sends", () => {
  const channel = new EventChannel();
  // a handler that opens a stream, but returns another response
  let closed = 0;
  let reopened: EventStream | undefined;
  channel.open().onClose(() => {
    closed++;
    // a new stream while the channel sends
    reopened = channel.open();
  });
  channel.open().onClose(() => {
    closed++;
  });
  assertEq(channel.size(), 2, "the streams after open");
  assertEq(channel.send("small"), 2, "the streams of a small event");
  assertEq(closed, 0, "onClose before the overflow");
  // more than 1 MiB with the small one
  assertEq(channel.send(string.rep("x", 1024 * 1024 - 10)), 0, "the streams of a large event");
  assertEq(closed, 2, "onClose after the overflow");
  assertEq(channel.size(), 1, "the streams after the overflow");
  assert(reopened !== undefined && !reopened.isClosed(), "the new stream is closed");
  channel.close();
});

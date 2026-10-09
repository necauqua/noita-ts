// Server-sent events (SSE), for the `EventSource` of a browser.

import type { HeaderMap } from "../common";
import type { ServerResponse } from "./message";
import { printError, withDefaults } from "./util";

/**
 * An event of an {@link EventStream}: its type (`event` of the `EventSource`
 * of a browser, `message` by default) and its data. A string is the data of
 * an event.
 */
export type ServerEvent = string | { event?: string; data: string };

/**
 * The text of an event in an event stream: each line of the data is a
 * `data:` line. The type is not checked.
 */
const formatEvent = (event: ServerEvent) => {
  const e = typeof event === "string" ? { data: event } : event;
  const lines: string[] = [];
  if (e.event !== undefined) {
    lines.push(`event: ${e.event}`);
  }
  for (const line of string.gsub(e.data, "\r\n?", "\n")[0].split("\n")) {
    lines.push(`data: ${line}`);
  }
  return `${lines.join("\n")}\n\n`;
};

/**
 * The most bytes that can wait to be sent (also the ones that the server
 * still writes), when the client reads slower than the events come. Past
 * that, the server closes the connection.
 */
const MAX_BUFFERED_BYTES = 1024 * 1024;

/** Prints an error of an `onClose` function that no server reports. */
const printCloseError = (error: unknown) =>
  printError("onClose of an event stream", error);

/**
 * A stream of server-sent events: return {@link response} from a handler,
 * then {@link send} the events. The server sends them as they come, once per
 * poll, and closes the connection after the end.
 *
 * ```ts
 * router.get("/events", () => {
 *   const events = new EventStream();
 *   events.send({ event: "hello", data: "world" });
 *   return events.response();
 * });
 * ```
 *
 * The stream closes when the handler ends it, when the client goes away, when
 * the server closes or is released, or when more than 1 MiB waits to be
 * sent. Then it takes no more events. The functions of {@link onClose} run
 * when the response is over; for a stream that no server sends, only when
 * more than 1 MiB waits, so never after {@link end}.
 *
 * A stream is the body of one response only: the server answers another
 * response with the same stream with 500.
 *
 * See {@link EventChannel} to send events to many streams.
 */
export class EventStream {
  private parts: string[] = [];
  /** The bytes of `parts`, and the ones that the server still writes. */
  private buffered = 0;
  /** The handler ended the stream; what waits is still sent. */
  private ended = false;
  /** Too much waited to be sent: the connection closes at once. */
  private overflowed = false;
  /** The response is over, and the functions of `onClose` are called. */
  private finished = false;
  private closeHandlers: ((this: void) => void)[] = [];
  /**
   * A server took the stream as the body of a response, so the server calls
   * {@link _finish}.
   *
   * @internal
   */
  _served = false;
  /**
   * The channel of the stream, which forgets the stream when it closes.
   *
   * @internal
   */
  _channel?: EventChannel;

  /** Whether the stream takes no more events. */
  isClosed() {
    return this.ended || this._stopped();
  }

  /**
   * Sends an event (a string is its data). Returns false, and sends nothing,
   * when the stream is closed.
   */
  send(event: ServerEvent): boolean {
    return this._write(formatEvent(event));
  }

  /** Ends the stream, after the events that still wait to be sent. */
  end() {
    this.ended = true;
    this.leaveChannel();
  }

  /**
   * Calls `handler` once when the response is over: all of it is sent, or the
   * connection is gone. Calls it at once if the response is over already;
   * its errors are then printed. A stream that no server sends calls it when
   * more than 1 MiB waits, as the stream can then never be sent; its errors
   * are then printed too. Such a stream takes no events after {@link end},
   * so it then never calls `handler`.
   */
  onClose(handler: (this: void) => void) {
    if (this.finished) {
      try {
        handler();
      } catch (e) {
        printCloseError(e);
      }
    } else {
      this.closeHandlers.push(handler);
    }
  }

  /**
   * The response that starts the stream: status 200, `headers`, and the
   * headers of an event stream that `headers` does not have (by their names
   * in any case).
   */
  response(headers?: HeaderMap): ServerResponse {
    return {
      headers: withDefaults(headers, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      }),
      body: this,
    };
  }

  /**
   * Adds the text of an event; false when the stream is closed.
   *
   * @internal
   */
  _write(text: string): boolean {
    if (this.isClosed()) {
      return false;
    }
    if (this.buffered + text.length > MAX_BUFFERED_BYTES) {
      this.overflowed = true;
      // a server that sends the stream finishes it when it sees the overflow
      if (this._served) {
        this.parts = [];
        this.buffered = 0;
        this.leaveChannel();
      } else {
        this._finish(printCloseError);
      }
      return false;
    }
    this.parts.push(text);
    this.buffered += text.length;
    return true;
  }

  /**
   * Takes the text that waits to be sent, and whether the handler ended the
   * stream. The text still counts against the limit until {@link _sent}.
   *
   * @internal
   */
  _take(): [string, boolean] {
    const text = this.parts.join("");
    this.parts = [];
    return [text, this.ended];
  }

  /**
   * Whether the response must stop at once: too much waited to be sent, or
   * the response is over (a stream that overflowed before a server took it
   * is finished already).
   *
   * @internal
   */
  _stopped() {
    return this.overflowed || this.finished;
  }

  /**
   * Tells that `bytes` of the text of {@link _take} are written, so they no
   * longer count against the limit.
   *
   * @internal
   */
  _sent(bytes: number) {
    // an overflow or the finish cleared the count already
    this.buffered = math.max(0, this.buffered - bytes);
  }

  /**
   * Marks the response over, and calls the functions of `onClose`; the errors
   * of those go to `report`.
   *
   * @internal
   */
  _finish(report: (this: void, error: unknown) => void) {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.parts = [];
    this.buffered = 0;
    this.leaveChannel();
    const handlers = this.closeHandlers;
    this.closeHandlers = [];
    // all the handlers run, also when `report` throws
    const errors: unknown[] = [];
    for (const handler of handlers) {
      try {
        handler();
      } catch (e) {
        errors.push(e);
      }
    }
    for (const e of errors) {
      report(e);
    }
  }

  /** Removes the stream from its channel, as it takes no more events. */
  private leaveChannel() {
    this._channel?._forget(this);
    this._channel = undefined;
  }
}

/**
 * The open event streams of many clients, and events for all of them.
 *
 * ```ts
 * const channel = new EventChannel();
 * router.get("/events", () => channel.open().response());
 * channel.send({ event: "death", data: "the player died" });
 * ```
 */
export class EventChannel {
  private streams = new LuaSet<EventStream>();
  /** The number of {@link streams}. */
  private count = 0;

  /** The number of the open streams. */
  size() {
    return this.count;
  }

  /**
   * A new stream of the channel; return its `response()` from a handler. The
   * channel forgets the stream when it closes. A stream that no server sends
   * (for example when the handler returns another response) closes, and calls
   * its `onClose` functions, when 1 MiB of events waits for it.
   */
  open(): EventStream {
    const stream = new EventStream();
    stream._channel = this;
    this.streams.add(stream);
    this.count++;
    return stream;
  }

  /**
   * Sends an event (a string is its data) to all the open streams, and
   * returns their number.
   */
  send(event: ServerEvent): number {
    const text = formatEvent(event);
    let sent = 0;
    // a copy, as a stream that overflows leaves the set here, and its
    // `onClose` functions can open new streams
    const streams: EventStream[] = [];
    for (const stream of this.streams) {
      streams.push(stream);
    }
    for (const stream of streams) {
      if (stream._write(text)) {
        sent++;
      }
    }
    return sent;
  }

  /**
   * Ends all the open streams, after what waits to be sent, and forgets
   * them. The channel can open new streams after that.
   */
  close() {
    // each stream leaves the set when it ends
    for (const stream of this.streams) {
      stream.end();
    }
  }

  /**
   * Forgets a stream of the channel.
   *
   * @internal
   */
  _forget(stream: EventStream) {
    if (this.streams.has(stream)) {
      this.streams.delete(stream);
      this.count--;
    }
  }
}

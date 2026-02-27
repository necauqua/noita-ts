/**
 * DISCLAIMER:
 * Similar to nxml, this typedef was semi-vibecoded, this will likely be tested
 * more thoroughly though.
 */

/** @noSelfInFile */

declare namespace pollnet {
  const VERSION: string;

  type SocketStatus =
    | "unpolled"
    | "invalid"
    | "invalid_handle"
    | "open"
    | "opening"
    | "error"
    | "closed";

  /** Initializes the pollnet context */
  function init(): void;

  /** Initializes the pollnet context using the static hack */
  function init_hack_static(): void;

  /** Shuts down the pollnet context */
  function shutdown(): void;

  /** Sleeps (blocks) for the given milliseconds */
  function sleep_ms(ms: number): void;

  /** Generates a nanoid string */
  function nanoid(): string;

  /** Formats headers as a string */
  function format_headers(
    headers: Record<string, string | string[]> | string,
  ): string;

  /** Parses headers from a string */
  function parse_headers(headers: string): Record<string, string>;

  /** Parses HTTP method line */
  function parse_method(
    line: string,
  ): LuaMultiReturn<
    [method: string, path: string, query: Record<string, string>]
  >;

  /** Wraps a request handler for HTTP server */
  function wrap_req_handler(
    handler: (req: {
      addr: string;
      method: string;
      path: string;
      query: Record<string, string>;
      headers: Record<string, string>;
      body: string;
      raw: string[];
    }) => {
      status?: string;
      headers?: Record<string, string | string[]>;
      body?: string;
    },
    expose_errors?: boolean,
  ): (req_sock: Socket, addr: string) => void;

  /** Opens a websocket client */
  function open_ws(url: string): Socket;

  /** Listens for websocket connections */
  function listen_ws(
    addr: string,
    callback?: (sock: Socket, addr: string) => void,
  ): Socket;

  /** Opens a TCP client */
  function open_tcp(addr: string): Socket;

  /** Listens for TCP connections */
  function listen_tcp(
    addr: string,
    callback?: (sock: Socket, addr: string) => void,
  ): Socket;

  /** Serves HTTP (static or dynamic) */
  function serve_http(addr: string, dir?: string): Socket;

  /** Serves dynamic HTTP */
  function serve_dynamic_http(
    addr: string,
    keep_alive?: boolean,
    callback?: (sock: Socket, addr: string) => void,
  ): Socket;

  /** Performs an HTTP GET */
  function http_get(
    url: string,
    headers?: Record<string, string | string[]> | string,
    ret_body_only?: boolean,
  ): Socket;

  /** Performs an HTTP POST */
  function http_post(
    url: string,
    headers?: Record<string, string | string[]> | string,
    body?: string,
    ret_body_only?: boolean,
  ): Socket;

  function Socket(): Socket;

  interface Socket {
    /** Opens a websocket client */
    open_ws(url: string): this;

    /** Opens a TCP client */
    open_tcp(addr: string): this;

    /** Serves HTTP (static or dynamic) */
    serve_http(addr: string, dir?: string): this;

    /** Adds a virtual file to HTTP server */
    add_virtual_file(filename: string, filedata: string): void;

    /** Removes a virtual file from HTTP server */
    remove_virtual_file(filename: string): void;

    /** Listens for websocket connections */
    listen_ws(
      addr: string,
      callback?: (sock: Socket, addr: string) => void,
    ): this;

    /** Listens for TCP connections */
    listen_tcp(
      addr: string,
      callback?: (sock: Socket, addr: string) => void,
    ): this;

    /** Serves dynamic HTTP */
    serve_dynamic_http(
      addr: string,
      keep_alive?: boolean,
      callback?: (sock: Socket, addr: string) => void,
    ): this;

    /** Sets a connection handler */
    on_connection(callback: (sock: Socket, addr: string) => void): this;

    /** Polls for socket events */
    poll(): LuaMultiReturn<[true, undefined]> | LuaMultiReturn<[false, string]>;

    /** Awaits a message (coroutine.yield) */
    await():
      | LuaMultiReturn<[string, undefined]>
      | LuaMultiReturn<[false, string]>;

    /** Awaits N messages */
    await_n(
      count: number,
    ): LuaMultiReturn<[string[], undefined]> | LuaMultiReturn<[false, string]>;

    /** Gets the last message */
    last_message(): string | undefined;

    /** Gets the status */
    status(): SocketStatus | undefined;

    /** Sends a string message */
    send(msg: string): void;

    /** Sends a binary message */
    send_binary(msg: string): void;

    /** Closes the socket */
    close(): void;

    /** Is HTTP server */
    is_http_server?: boolean;

    /** Parent socket (for server connections) */
    parent?: Socket;

    /** Remote address (for server connections) */
    remote_addr?: string;

    /** Timeout for await */
    timeout?: number;
  }

  function Reactor(): Reactor;

  interface Reactor {
    /** Initializes a reactor */
    init(): void;

    /** Runs a coroutine thread */
    run(thread_body: (self: Reactor) => Promise<void> | void): void;

    /** Runs a server with client handler */
    run_server(
      server_sock: Socket,
      client_body: (sock: Socket, addr: string) => Promise<void> | void,
    ): void;

    /** Logs messages */
    log(...args: any[]): void;

    /** Updates reactor (runs threads) */
    update(): number;
  }
}

export default pollnet;

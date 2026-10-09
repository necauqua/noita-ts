// The requests and the responses of the server, and the router.

import type { HeaderMap } from "../common";
import type { EventStream } from "./stream";
import { withDefaults } from "./util";

/** A request to an {@link HttpServer}. */
export interface ServerRequest {
  /** The method, in upper case, as the client sent it. */
  method: string;
  /** The target of the request line, for example `/a%20b?c=d`. */
  target: string;
  /** The path of the target, without the query; not decoded. */
  path: string;
  /** The parameters of the query, decoded. The last of a repeated key wins. */
  query: Record<string, string>;
  /**
   * The headers, with lower-case names. The values of a header that comes
   * more than once are joined with `, ` (with `; ` for `cookie`).
   */
  headers: Record<string, string>;
  /**
   * The body (also of a chunked request, decoded), or an empty string when
   * the request has none.
   */
  body: string;
  /**
   * Whether the client closed the connection before the response. The server
   * sets it while an async handler waits, and does not send the response of
   * such a request.
   */
  readonly aborted: boolean;
}

/** The response to a {@link ServerRequest}. */
export interface ServerResponse {
  /**
   * An integer from 200 to 999 (a 1xx status is not a final response).
   * Defaults to 200.
   */
  status?: number;
  /**
   * The headers. The server sets `Content-Length` and `Connection` itself,
   * and drops these headers and `Transfer-Encoding` from this map.
   */
  headers?: HeaderMap;
  /**
   * The body, or an {@link EventStream} (see {@link EventStream.response}).
   * Defaults to an empty body.
   */
  body?: string | EventStream;
}

/**
 * What answers the requests of an {@link HttpServer}: a {@link Router}, or
 * for example `{ handle: (req) => ({ body: "hi" }) }`.
 */
export interface RequestHandler {
  /**
   * Answers a request: with a response, or with a promise of one (for
   * example, an async function that waits for a request of an
   * `HttpClient`).
   */
  handle(req: ServerRequest): ServerResponse | Promise<ServerResponse>;
}

/** The handler of a route of a {@link Router}: see {@link RequestHandler.handle}. */
export type RouteHandler = (
  this: void,
  req: ServerRequest,
) => ServerResponse | Promise<ServerResponse>;

/**
 * A plain-text response: `status`, `headers` with
 * `Content-Type: text/plain; charset=utf-8` when they have no `Content-Type`
 * (by the name in any case), and `text` and a line break as the body.
 */
export const plain = (
  status: number,
  text: string,
  headers?: HeaderMap,
): ServerResponse => ({
  status,
  headers: withDefaults(headers, {
    "Content-Type": "text/plain; charset=utf-8",
  }),
  body: `${text}\n`,
});

/**
 * Picks a handler for a request by its method and its exact path (without
 * the query, not decoded), as the handler of an {@link HttpServer}. An
 * unknown path gets 404; a known path with another method gets 405, with an
 * `Allow` header.
 *
 * ```ts
 * const router = new Router()
 *   .get("/callback", (req) => ({ body: `the code: ${req.query.code}` }))
 *   .get("/events", () => channel.open().response());
 * const server = new HttpServer(scheduler, router);
 * ```
 */
export class Router implements RequestHandler {
  /** The handlers of each path, by their methods. */
  private routes: Record<string, Record<string, RouteHandler>> = {};

  /**
   * Adds a route for `method` and `path`, or replaces it. A path without a
   * leading `/` gets one.
   */
  route(method: string, path: string, handler: RouteHandler): this {
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    this.routes[path] ??= {};
    this.routes[path][method.toUpperCase()] = handler;
    return this;
  }

  get(path: string, handler: RouteHandler): this {
    return this.route("GET", path, handler);
  }

  post(path: string, handler: RouteHandler): this {
    return this.route("POST", path, handler);
  }

  /** Routes a request. */
  handle(req: ServerRequest) {
    const methods = this.routes[req.path];
    if (methods === undefined) {
      return plain(404, "not found");
    }
    const handler = methods[req.method];
    if (handler === undefined) {
      const allowed = Object.keys(methods);
      allowed.sort();
      return plain(405, "method not allowed", { Allow: allowed.join(", ") });
    }
    return handler(req);
  }
}

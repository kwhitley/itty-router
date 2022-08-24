/// <reference types="@cloudflare/workers-types" />

type InferParams<Path extends string, Matched extends string = never> =
  // Start by attempting to match something we know is a param
  Path extends `/:${infer Match}/${infer Rest}`
    ? // If we've matched, add it to the list of matches, and continue with the next piece
      InferParams<`/${Rest}`, Match | Matched>
    : // Otherwise, we know the next route segment is not a match
    Path extends `/${infer _Part}/${infer Rest}`
    ? // ...and we continue matching
      InferParams<`/${Rest}`, Matched>
    : // When we've gotten here, we know there are no more named segments, check if the last one is optional
    Path extends `/:${infer OptionalMatch}?`
    ? // Log the result + the optional match
      { [K in Matched]: string } & Partial<
        InferParams<`/:${OptionalMatch}`, never>
      >
    : // If there's a trailing *, we ignore it
    Path extends `/:${infer Match}*`
    ? { [K in Matched | Match]: string }
    : // Otherwise, check if it's a normal final match
    Path extends `/:${infer Match}`
    ? { [K in Matched | Match]: string }
    : // Return our matches
      { [K in Matched]: string };

// Extend the standard CloudFlare Request interface, adding in properties that we've added in itty-router
export interface IttyRequest<
  Path extends string,
  Method extends string = string
> extends Request {
  method: Method;
  params: InferParams<Path>;
  query: Record<string, string>;
}

export type IttyRequestHandler<
  Path extends string = string,
  HandlerArgs extends any[] = [],
  Method extends string = string
> = (
  req: IttyRequest<Path, Method>,
  ...args: HandlerArgs
) => Response | Promise<Response> | void;

export type IttyMethodHandler<
  Method extends string,
  HandlerArgs extends any[]
> = <Path extends `/${string}`>(
  path: Path,
  handler: IttyRequestHandler<Path, HandlerArgs, Method>
) => IttyRouterApi<HandlerArgs>;

export interface IttyRouterApi<HandlerArgs extends any[]> {
  get: IttyMethodHandler<"GET", HandlerArgs>;
  head: IttyMethodHandler<"HEAD", HandlerArgs>;
  post: IttyMethodHandler<"POST", HandlerArgs>;
  put: IttyMethodHandler<"PUT", HandlerArgs>;
  delete: IttyMethodHandler<"DELETE", HandlerArgs>;
  connect: IttyMethodHandler<"CONNECT", HandlerArgs>;
  options: IttyMethodHandler<"OPTIONS", HandlerArgs>;
  trace: IttyMethodHandler<"TRACE", HandlerArgs>;
  patch: IttyMethodHandler<"PATCH", HandlerArgs>;
  all: IttyMethodHandler<string, HandlerArgs>;
  handle: (req: Request, ...args: HandlerArgs) => Promise<Response | void>;
}

export type IttyRouterDefinition = [
  string,
  RegExp,
  IttyRequestHandler<any, any>[]
];

export interface IttyRouterConfig {
  base?: string;
  routes?: IttyRouterDefinition[];
}

export function Router<
  HandlerArgs extends any[] = [unknown, ExecutionContext],
  ApiExtensions = {}
>(
  ittyConfig: IttyRouterConfig = {}
): IttyRouterApi<HandlerArgs> & ApiExtensions {
  const { base = "", routes = [] as IttyRouterDefinition[] } = ittyConfig;
  // The __proto__ use makes things basically impossible to type properly, so we tack an "as any" on the bottom to keep it quiet
  return {
    __proto__: new Proxy(
      {},
      {
        get: (target, prop, receiver) =>
          typeof prop !== "string"
            ? Reflect.get(target, prop, receiver)
            : (route: string, ...handlers: IttyRequestHandler<any, any>[]) =>
                routes.push([
                  prop.toUpperCase(),
                  RegExp(
                    `^${
                      (base + route)
                        .replace(/(\/?)\*/g, "($1.*)?") // trailing wildcard
                        .replace(/\/$/, "") // remove trailing slash
                        .replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3") // named params
                        .replace(/\.(?=[\w(])/, "\\.") // dot in path
                        .replace(
                          /\)\.\?\(([^\[]+)\[\^/g,
                          "?)\\.?($1(?<=\\.)[^\\."
                        ) // optional image format
                    }/*$`
                  ),
                  handlers,
                ]) && receiver,
      }
    ),
    routes,
    async handle(request: Request & { proxy?: Request }, ...args: HandlerArgs) {
      let response,
        match,
        url = new URL(request.url);
      (request as IttyRequest<any>).query = Object.fromEntries(
        url.searchParams
      );
      for (let [method, route, handlers] of routes) {
        if (
          (method === request.method || method === "ALL") &&
          (match = url.pathname.match(route))
        ) {
          (request as IttyRequest<any>).params = match.groups as Record<
            string,
            string
          >;
          for (let handler of handlers) {
            if (
              (response = await handler(
                (request.proxy || request) as IttyRequest<any>,
                ...args
              )) !== undefined
            )
              return response;
          }
        }
      }
    },
  } as any;
}

export default {
  Router,
};

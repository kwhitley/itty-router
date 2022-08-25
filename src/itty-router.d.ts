declare type InferParams<Path extends string, Matched extends string = never> =
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

// Non-platform specific Request shape
export interface IttyGenericRequest {
  url: string;
  method: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

// Extend the generic Request interface, with any narrowed properties that we've
// captured & inferred in the route
export declare type IttyRequest<
  Path extends string,
  Req extends IttyGenericRequest = Request,
  Method extends string = string
> = Req & {
  method: Method;
  params: InferParams<Path>;
  query: Record<string, string>;
};

export declare type IttyRequestHandler<
  HandlerArgs extends any[],
  Path extends string = string,
  Res = any,
  Req extends IttyGenericRequest = Request,
  Method extends string = string
> = (
  req: IttyRequest<Path, Req, Method>,
  ...args: HandlerArgs
) => Res | Promise<Res>;

export declare type IttyMethodHandler<
  Method extends string = string,
  HandlerArgs extends any[] = [],
  Res = any,
  Req extends IttyGenericRequest = Request
> = <Path extends string>(
  path: Path,
  handler: IttyRequestHandler<HandlerArgs, Path, Res, Req, Method>
) => IttyRouterApi<HandlerArgs, Res>;

export interface IHTTPMethods<
  HandlerArgs extends any[] = [],
  HandlerReturn = any
> {
  get: IttyMethodHandler<"GET", HandlerArgs, HandlerReturn>;
  head: IttyMethodHandler<"HEAD", HandlerArgs, HandlerReturn>;
  post: IttyMethodHandler<"POST", HandlerArgs, HandlerReturn>;
  put: IttyMethodHandler<"PUT", HandlerArgs, HandlerReturn>;
  delete: IttyMethodHandler<"DELETE", HandlerArgs, HandlerReturn>;
  connect: IttyMethodHandler<"CONNECT", HandlerArgs, HandlerReturn>;
  options: IttyMethodHandler<"OPTIONS", HandlerArgs, HandlerReturn>;
  trace: IttyMethodHandler<"TRACE", HandlerArgs, HandlerReturn>;
  patch: IttyMethodHandler<"PATCH", HandlerArgs, HandlerReturn>;
}

export interface IttyRouterApi<
  HandlerArgs extends any[],
  HandlerReturn extends any
> extends IHTTPMethods<HandlerArgs, HandlerReturn> {
  all: IttyMethodHandler<string, HandlerArgs>;
  handle: (
    req: IttyGenericRequest,
    ...args: HandlerArgs
  ) => Promise<Awaited<HandlerReturn>>;
}

export declare type IttyRouterDefinition = [
  string,
  RegExp,
  IttyRequestHandler<any, any>[]
];

export interface IttyRouterConfig {
  base?: string;
  routes?: IttyRouterDefinition[];
}

export interface IttyRouterTypeConfig {
  // Specifies the arguments passed in the .handle function,
  // and ensures they are correctly typed in all route method handlers
  handlerArgs?: any[];
  // Allows enforcing the expected return type of a handler function,
  // causing a type error if it does not match
  handlerReturn?: any;
  // Adds additional custom HTTP methods we expect to be accepted by the router
  methodExtension?: {
    [method: string]: IttyMethodHandler;
  };
}

// For backward compat w/ previous types
export type Route = IttyMethodHandler;

export declare type Router<TypeConfig extends IttyRouterTypeConfig = any> =
  IttyRouterApi<
    Exclude<TypeConfig["handlerArgs"], undefined>,
    Exclude<TypeConfig["handlerReturn"], undefined>
  > &
    Exclude<TypeConfig["methodExtension"], undefined>;

/**
 * Creates an "itty-router"
 *
 * Types may optionally supplied to the Router via the IttyRouterTypeConfig generic type
 * to configure the type expectations of the router:
 *
 * @example
 *   const rtr = Router<{ handlerArgs: [Env, ExecutionContext] }>()
 *
 *   rtr.get('/', (req, env, ctx) => {
 *     // env & ctx will have correct typings
 *   })
 *
 *   rtr.handle(req, env, ctx)
 */
export declare function Router<TypeConfig extends IttyRouterTypeConfig>(
  ittyConfig?: IttyRouterConfig
): Router<TypeConfig>;

declare const _default: {
  Router: typeof Router;
};

export default _default;

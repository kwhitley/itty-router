export type GenericTraps = {
  [key: string]: any
}

export type RequestLike = {
  method: string,
  url: string,
} & GenericTraps

export type IRequestStrict = {
  method: string,
  url: string,
  route: string,
  params: {
    [key: string]: string,
  },
  query: {
    [key: string]: string | string[] | undefined,
  },
  proxy?: any,
} & Request

export type IRequest = IRequestStrict & GenericTraps

export type RouterOptions = {
  base?: string
  routes?: RouteEntry[]
} & Record<string, any>

export type RouteHandler<I = IRequest, A extends any[] = any[]> = {
  (request: I, ...args: A): any
} & MaybeRouter

export type RouteEntry = [
  httpMethod: string,
  match: RegExp,
  handlers: RouteHandler[],
  path?: string,
]

// this is the generic "Route", which allows per-route overrides
export type Route = <RequestType = IRequest, Args extends any[] = any[], RT = RouterType>(
  path: string,
  ...handlers: RouteHandlerOrRouter<RequestType, Args>[]
) => RT

// this is an alternative UniveralRoute, accepting generics (from upstream), but without
// per-route overrides
export type UniversalRoute<RequestType = IRequest, Args extends any[] = any[]> = (
  path: string,
  ...handlers: RouteHandler<RequestType, Args>[]
) => RouterType<UniversalRoute<RequestType, Args>, Args>

// helper function to detect equality in types (used to detect custom Request on router)
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;

export type CustomRoutes<R = Route> = {
  [key: string]: R,
}

type MaybeRouter = {
  handle?: any
  fetch?: any
  base?: string
}

export type RouterType<R = Route, Args extends any[] = any[]> = {
  __proto__: RouterType<R>,
  routes: RouteEntry[],
  handle: <A extends any[] = Args>(request: RequestLike, ...extra: Equal<R, Args> extends true ? A : Args) => Promise<any>
  fetch: <A extends any[] = Args>(request: RequestLike, ...extra: Equal<R, Args> extends true ? A : Args) => Promise<any>
  base: string,
  all: R,
  delete: R,
  get: R,
  head: R,
  options: R,
  patch: R,
  post: R,
  put: R,
} & CustomRoutes<R> & Record<string, any>

type RouteHandlerOrRouter<RequestType = IRequest, Args extends any[] = any[]> = RouteHandler<RequestType, Args> | RouterType

export const Router = <
  RequestType = IRequest,
  Args extends any[] = any[],
  RouteType = Equal<RequestType, IRequest> extends true ? Route : UniversalRoute<RequestType, Args>
>({ base = '', routes = [], ...other }: RouterOptions = {}): RouterType<RouteType, Args> =>
  // @ts-expect-error TypeScript doesn't know that Proxy makes this work
  ({
    __proto__: new Proxy({}, {
      // @ts-expect-error (we're adding an expected prop "path" to the get)
      get: (target: any, prop: string, receiver: RouterType, path: string) => (route: string, ...handlers: RouteHandlerOrRouter<I>[]) => {
        // @ts-expect-error - patch for aliasing router.fetch
        if (prop == 'handle') return receiver.fetch(route, ...handlers)

        // this remaps handlers to allow for nested routers as handlers
        handlers = handlers.map(h =>
          h.fetch
            ? h.base ? h.fetch : (r, ...args) => {
                r.url = new URL(r.url)
                r.url.pathname = r.url.pathname.replace(route.replace(/\/\*$/, ''), '')

                return h.fetch(r, ...args)
              }
            : h
        )

        routes.push(
          [
            prop.toUpperCase(),
            RegExp(`^${(path = (base + route)
              .replace(/\/+(\/|$)/g, '$1'))                       // strip double & trailing splash
              .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')       // greedy params
              .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')  // named params and image format
              .replace(/\./g, '\\.')                              // dot in path
              .replace(/(\/?)\*/g, '($1.*)?')                     // wildcard
            }/*$`),
            // @ts-expect-error - not worth fixing for an internal type
            handlers,                                             // embed handlers
            path,                                                 // embed clean route path
          ]
        )

        return receiver
      }
    }),
    routes,
    base,
    ...other,
    async fetch (request: RequestLike, ...args)  {
      let response, match, url = new URL(request.url), query: Record<string, any> = request.query = { __proto__: null }

      // 1. parse query params
      for (let [k, v] of url.searchParams)
        query[k] = query[k] ? ([] as string[]).concat(query[k], v) : v

      // 2. then test routes
      for (let [method, regex, handlers, path] of routes)
        if ((method == request.method || method == 'ALL') && (match = url.pathname.match(regex))) {
          request.params = match.groups || {}                                     // embed params in request
          request.route = path                                                    // embed route path in request
          for (let handler of handlers)
            if ((response = await handler(request.proxy ?? request, ...args)) != null) return response
        }
    },
  })

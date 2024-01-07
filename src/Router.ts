export type GenericTraps = Record<string, any>

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
}

export type RouteHandler<R = IRequest, Args extends Array<any> = any[]> = {
  (request: R, ...args: Args): any
}

export type RouteEntry = [string, RegExp, RouteHandler[], string]

// this is the generic "Route", which allows per-route overrides
export type Route<R = IRequest, A extends Array<any> = any[]> = <RequestType = R, Args extends Array<any> = A>(
  path: string,
  ...handlers: RouteHandler<RequestType, Args>[]
) => RouterType<RequestType, Args>

export type CustomRoutes<R = Route> = {
  [key: string]: R,
}

export type RouterType<R = IRequest, A extends any[] = any[], Output = any> = {
  __proto__: RouterType<R>,
  routes: RouteEntry[],
  handle: <Args extends any[] = A>(request: RequestLike, ...extra: Args) => Promise<Output>
  all: Route<R, A>,
  delete: Route<R, A>,
  get: Route<R, A>,
  head: Route<R, A>,
  options: Route<R, A>,
  patch: Route<R, A>,
  post: Route<R, A>,
  put: Route<R, A>,
} & CustomRoutes<Route<R, A>>

export const Router = <
  RequestType = IRequest,
  Args extends any[] = any[]
>({ base = '', routes = [] }: RouterOptions = {}): RouterType<RequestType, Args> =>
  ({
    __proto__: new Proxy({}, {
      // @ts-expect-error (we're adding an expected prop "path" to the get)
      get: (target: any, prop: string, receiver: object, path: string) =>
        (route: string, ...handlers: RouteHandler<RequestType, Args>[]) =>
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
              // @ts-expect-error - fiddly
              handlers,                                             // embed handlers
              path,                                                 // embed clean route path
            ]
          ) && receiver
    }),
    routes,
    async handle (request: RequestLike, ...args)  {
      let response, match, url = new URL(request.url), query: Record<string, any> = request.query = { __proto__: null }

      // 1. parse query params
      for (let [k, v] of url.searchParams)
        query[k] = query[k] ? ([] as string[]).concat(query[k], v) : v

      // 2. then test routes
      for (let [method, regex, handlers, path] of routes)
        if ((method === request.method || method === 'ALL') && (match = url.pathname.match(regex))) {
          request.params = match.groups || {}                                     // embed params in request
          request.route = path                                                    // embed route path in request
          for (let handler of handlers)
            if ((response = await handler(request.proxy ?? request, ...args)) != null) return response
        }
    }
  } as RouterType<RequestType, Args>)

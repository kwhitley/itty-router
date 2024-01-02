import {
  Equal,
  IRequest,
  RequestLike,
  Route,
  RouterOptions,
  RouterType,
  UniversalRoute
} from 'Router'

export const IttyRouter = <
  RequestType = IRequest,
  Args extends any[] = any[],
  RouteType = Equal<RequestType, IRequest> extends true ? Route : UniversalRoute<RequestType, Args>
>({ base = '', routes = [], ...other }: RouterOptions = {}): RouterType<RouteType, Args> =>
  // @ts-expect-error TypeScript doesn't know that Proxy makes this work
  ({
    __proto__: new Proxy({}, {
      // @ts-expect-error (we're adding an expected prop "path" to the get)
      get: (target: any, prop: string, receiver: RouterType, path: string) => (route: string, ...handlers: RouteHandlerOrRouter<I>[]) => {
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

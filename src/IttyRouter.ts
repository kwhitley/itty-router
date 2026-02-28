import {
  IRequest,
  IttyRouterOptions,
  IttyRouterType,
  RequestHandler,
  RequestLike,
} from './types'
export const IttyRouter = <
  RequestType extends IRequest = IRequest,
  Args extends any[] = any[],
  ResponseType = any,
>({ base = '', routes = [], ...other }: IttyRouterOptions = {}): IttyRouterType<RequestType, Args, ResponseType> =>
// @ts-ignore
  ({
    __proto__: new Proxy({}, {
      // @ts-expect-error (we're using a 4th param as free local variable)
      get: (target: any, prop: string, receiver: object, path: string) =>
        (route: string, ...handlers: RequestHandler<RequestType, Args>[]) =>
          routes.push(
            [
              prop.toUpperCase(),
              RegExp(`^${(path = (base + route)
                .replace(/\/+(\/|$)/g, '$1'))                       // strip double & trailing slash
                .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')       // greedy params
                .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')  // named params and image format
                .replace(/\./g, '\\.')                              // dot in path
                .replace(/(\/?)\*/g, '($1.*)?')                     // wildcard
              }/*$`),
              // @ts-ignore
              handlers,                                             // embed handlers
              path,                                                 // embed clean route path
            ]
          ) && receiver
    }),
    routes,
    ...other,
    async fetch (request: RequestLike, ...args)  {
      let response,
          match,
          url = new URL(request.url),
          query: Record<string, any> = request.query = { __proto__: null }

      // 1. parse query params
      for (let [k, v] of url.searchParams)
        query[k] = query[k] ? [query[k], v].flat() : v

      // 2. then test routes
      for (let [method, regex, handlers, path] of routes)
        if ((method == request.method || method == 'ALL') && (match = url.pathname.match(regex))) {
          Object.assign(request, request.params = match.groups || {})             // embed params in request
          request.route = path                                                    // embed route path in request
          for (let handler of handlers)
            if ((response = await handler(request, ...args)) != null) return response
        }
    },
  })

import {
  IRequest,
  IttyRouterOptions,
  IttyRouterType,
  RequestHandler,
  RequestLike,
} from './types'
import { buildRoute } from './buildRoute'

export const IttyRouter = <
  RequestType extends IRequest = IRequest,
  Args extends any[] = any[],
  ResponseType = any,
>({ base = '', routes = [], ...other }: IttyRouterOptions = {}): IttyRouterType<RequestType, Args, ResponseType> =>
// @ts-ignore
  ({
    __proto__: new Proxy({}, {
      // @ts-expect-error (we're using a 4th param as free local variable)
      get: (target: any, prop: string, receiver: object, _r: any) =>
        (route: string, ...handlers: RequestHandler<RequestType, Args>[]) => (
          _r = buildRoute(base, route),
          routes.push([prop.toUpperCase(), _r[0], handlers, _r[1]]),
          receiver
        )
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

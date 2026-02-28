import {
  IRequest,
  RequestLike,
  RouterOptions,
  RouterType
} from './types'

export const Router = <
  RequestType = IRequest,
  Args extends any[] = any[],
  ResponseType = any
>({ base = '', routes = [], ...other }: RouterOptions<RequestType, Args> = {}): RouterType<RequestType, Args, ResponseType> =>
  ({
    // @ts-expect-error (Proxy-based method registration)
    __proto__: new Proxy({}, {
      // @ts-expect-error (we're using a 4th param as free local variable for path)
      get: (target: any, prop: string, receiver: object, path: string) =>
        (route: string, ...handlers: any[]) =>
          (routes.push(
            [
              prop.toUpperCase(),
              RegExp(`^${(path = (base + route)
                .replace(/\/+(\/|$)/g, '$1'))                       // strip double & trailing slash
                .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')       // greedy params
                .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')  // named params and image format
                .replace(/\./g, '\\.')                              // dot in path
                .replace(/(\/?)\*/g, '($1.*)?')                     // wildcard
              }/*$`),
              handlers,
              path,
            ]
          ), receiver)
    }),
    routes,
    ...other,
    async fetch (request: RequestLike, ...args: any) {
      let response,
          match,
          url = new URL(request.url)

      request.query = { __proto__: null }
      for (let [k, v] of url.searchParams)
        (request.query as any)[k] = (request.query as any)[k] ? [(request.query as any)[k], v].flat() : v

      t: try {
        for (let handler of other.before || [])
          if ((response = await handler(request, ...args)) != null) break t

        outer: for (let [method, regex, handlers, path] of routes)
          if ((method == request.method || method == 'ALL') && (match = url.pathname.match(regex))) {
            for (let k in (request.params = match.groups || {})) (request as any)[k] = request.params[k]
            request.route = path

            for (let handler of handlers)
              if ((response = await handler(request, ...args)) != null) break outer
          }
      } catch (err: any) {
        if (!other.catch) throw err
        response = await other.catch(err, request, ...args)
      }

      try {
        for (let handler of other.finally || [])
          response = await handler(response, request, ...args) ?? response
      } catch(err: any) {
        if (!other.catch) throw err
          response = await other.catch(err, request, ...args)
      }

      return response
    },
  } as RouterType<RequestType, Args, ResponseType>)

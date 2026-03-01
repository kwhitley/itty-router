import {
  IRequest,
  RequestLike,
  RouterOptions,
  RouterType
} from './types'

export const TunedRouter = <
  RequestType = IRequest,
  Args extends any[] = any[],
  ResponseType = any
>({ base = '', routes = [], ...other }: RouterOptions<RequestType, Args> = {}): RouterType<RequestType, Args, ResponseType> => {
  const route = (method: string) =>
    (path: string, ...handlers: any[]) => (
      routes.push(
        [
          method,
          RegExp(`^${(path = (base + path)
            .replace(/\/+(\/|$)/g, '$1'))                       // strip double & trailing slash
            .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')       // greedy params
            .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')  // named params and image format
            .replace(/\./g, '\\.')                              // dot in path
            .replace(/(\/?)\*/g, '($1.*)?')                     // wildcard
          }/*$`),
          handlers,
          path,
        ]
      ),
      r
    )

  const r = {
    routes,
    ...other,
    async fetch (request: RequestLike, ...args: any) {
      let response,
          match,
          raw = request.url,
          p = raw.indexOf('/', 8),
          q = raw.indexOf('?', p),
          origin = raw.slice(0, p),
          pathname = raw.slice(p, q < 0 ? undefined : q),
          search = q < 0 ? '' : raw.slice(q),
          query: Record<string, any> = request.query = { __proto__: null }

      for (let [k, v] of new URLSearchParams(search))
        query[k] = query[k] ? [query[k], v].flat() : v

      t: try {
        for (let handler of other.before || [])
          if ((response = await handler(request, ...args)) != null) break t

        outer: for (let [method, regex, handlers, path] of routes)
          if ((method == request.method || method == 'ALL') && (match = pathname.match(regex))) {
            Object.assign(request, request.params = match.groups || {})
            request.route = path

            for (let handler of handlers)
              if ((response = await (handler.fetch
                ? handler.fetch({ ...request, url: origin + (match.at(-1) || '/') + search, method: request.method, headers: request.headers }, ...args)
                : handler(request, ...args)
              )) != null) break outer
          }
      } catch (err: any) {
        if (!other.catch) throw err
        response = await other.catch(err, request, ...args)
      }

      try {
        for (let handler of other.after || [])
          response = await handler(response, request, ...args) ?? response
      } catch(err: any) {
        if (!other.catch) throw err
          response = await other.catch(err, request, ...args)
      }

      return response
    },
  } as RouterType<RequestType, Args, ResponseType>

  for (let m of ['delete','get','head','options','patch','post','put','all'])
    (r as any)[m] = route(m.toUpperCase())

  return r
}

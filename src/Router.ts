import {
  Equal,
  IRequest,
  IttyRouterOptions,
  IttyRouterType,
  RequestLike,
  Route,
  RouteHandler,
  UniversalRoute
} from './IttyRouter'

export type ResponseHandler<ResponseType = any, RequestType = IRequest, Args extends any[] = any[]> =
    (response: ResponseType, request: RequestType, ...args: Args) => any

export type ErrorHandler<ErrorType = Error, RequestType = IRequest, Args extends any[] = any[]> =
    (response: ErrorType, request: RequestType, ...args: Args) => any

export type RouterType<R = Route, Args extends any[] = any[]> = {
  before?: RouteHandler[]
  catch?: ErrorHandler
  finally?: ResponseHandler[]
} & IttyRouterType<R, Args>

export type RouterOptions = {
  before?: RouteHandler[]
  catch?: ErrorHandler
  finally?: ResponseHandler[]
} & IttyRouterOptions

export const Router = <
  RequestType = IRequest,
  Args extends any[] = any[],
  RouteType = Equal<RequestType, IRequest> extends true ? Route : UniversalRoute<RequestType, Args>
>({ base = '', routes = [], ...other }: RouterOptions = {}): RouterType<RouteType, Args> =>
  // @ts-expect-error TypeScript doesn't know that Proxy makes this work
  ({
    __proto__: new Proxy({}, {
      // @ts-expect-error (we're adding an expected prop "path" to the get)
      get: (target: any, prop: string, receiver: RouterType, path: string) =>
        // @ts-expect-error - unresolved type
        (route: string, ...handlers: RouteHandler<I>[]) =>
          routes.push(
            [
              prop.toUpperCase?.(),
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
          ) && receiver
    }),
    routes,
    ...other,
    async fetch (request: RequestLike, ...args) {
      let response,
          match,
          url = new URL(request.url),
          query: Record<string, any> = request.query = { __proto__: null }

      // 1. parse query params
      for (let [k, v] of url.searchParams)
        query[k] = query[k] ? ([] as string[]).concat(query[k], v) : v

      t: try {
        for (let handler of other.before || [])
          if ((response = await handler(request.proxy ?? request, ...args)) != null) break t

        // 2. then test routes
        outer: for (let [method, regex, handlers, path] of routes)
          if ((method == request.method || method == 'ALL') && (match = url.pathname.match(regex))) {
            request.params = match.groups || {}                                     // embed params in request
            request.route = path                                                    // embed route path in request

            for (let handler of handlers)
              if ((response = await handler(request.proxy ?? request, ...args)) != null) break outer
          }
      } catch (err: any) {
        if (!other.catch) throw err
        response = await other.catch(err, request.proxy ?? request, ...args)
      }

      try {
        for (let handler of other.finally || [])
          response = await handler(response, request.proxy ?? request, ...args) ?? response
      } catch(err: any) {
        if (!other.catch) throw err
          response = await other.catch(err, request.proxy ?? request, ...args)
      }

      return response
    },
  })

// const finallyHandler: RouteHandler<Response> = (response) => { response.headers }
// const errorHandler: ErrorHandler<Error> = (err) => { err.message }

// const router = Router({
//   finally: [
//     finallyHandler,
//     (response: Response) => { response.headers },
//   ],
//   catch: errorHandler,
// })

// type CustomRequest = {
//   foo: string
// } & IRequest

// router.before = [
//   (r: CustomRequest | IRequest) => { r.foo }
// ]

// router.get<CustomRequest>('/', (r) => r.foo)



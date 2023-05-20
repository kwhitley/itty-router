/*
TYPE REQUIREMENTS

- ability to define custom methods on the router
  - these should chain

- ability to define custom request types on a route
  - NICE TO HAVE: define request type for entire router

*/

export type GenericTraps = {
  [key: string]: any
}

export type RequestLike = {
  method: string,
  url: string,
} & GenericTraps

export type IRequest = {
  method: string,
  url: string,
  params: {
    [key: string]: string,
  },
  query: {
    [key: string]: string | string[] | undefined,
  },
  proxy?: any,
} & GenericTraps

export type RouterOptions = {
  base?: string
  routes?: RouteEntry[]
}

// export type RouteHandler<I = IRequest> = {
//   (request: I, ...args: any): any
// }

export type RouteHandler<I = IRequest, A extends any[] = any[]> = {
  (request: I, ...args: A): any
}

export type RouteEntry = [string, RegExp, RouteHandler[], string]

export type Route = <RequestType = IRequest, Args extends any[] = any[], RT = RouterType>(
  path: string,
  ...handlers: RouteHandler<RequestType, Args>[]
) => RT

export type GenericRoute<RequestType = IRequest, Args extends any[] = any[], RT = RouterType> = (
  path: string,
  ...handlers: RouteHandler<RequestType, Args>[]
) => RT

export type RouterHints = {
  all: Route,
  delete: Route,
  get: Route,
  head: Route,
  options: Route,
  patch: Route,
  post: Route,
  put: Route,
}

export type RouterType = {
  __proto__: RouterType,
  routes: RouteEntry[],
  handle: (request: RequestLike, ...extra: any) => Promise<any>
} & RouterHints

export const Router = <
  I = IRequest,
  Args extends any[] = any[],
  RT = RouterType,
>({ base = '', routes = [] }: RouterOptions = {}): RT =>
  // @ts-expect-error TypeScript doesn't know that Proxy makes this work
  ({
    __proto__: new Proxy({} as RT, {
      // @ts-expect-error (we're adding an expected prop "path" to the get)
      get: (target: any, prop: string, receiver: object, path: string) => (route: string, ...handlers: RouteHandler<I>[]) =>
        routes.push(
          [
            prop.toUpperCase(),
            RegExp(`^${(path = (base + '/' + route).replace(/\/+(\/|$)/g, '$1'))  // strip double & trailing splash
              .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')                       // greedy params
              .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')                  // named params and image format
              .replace(/\./g, '\\.')                                              // dot in path
              .replace(/(\/?)\*/g, '($1.*)?')                                     // wildcard
            }/*$`),
            handlers,                                                             // embed handlers
            path,                                                                 // embed clean route path
          ]
        ) && receiver
    }),
    routes,
    async handle (request: RequestLike, ...args)  {
      let response, match, url = new URL(request.url), query: any = request.query = {}
      for (let [k, v] of url.searchParams) {
        query[k] = query[k] === undefined ? v : [query[k], v].flat()
      }
      for (let [method, regex, handlers, path] of routes) {
        if ((method === request.method || method === 'ALL') && (match = url.pathname.match(regex))) {
          request.params = match.groups || {}                                     // embed params in request
          request.route = path                                                    // embed route path in request
          for (let handler of handlers) {
            if ((response = await handler(request.proxy || request, ...args)) !== undefined) return response
          }
        }
      }
    }
  })

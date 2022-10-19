export type RequestTraps = {
  [key: string]: any
}

export type RequestLike = {
  method: string,
  url: string,
} & RequestTraps

export interface RouterOptions {
  base?: string
  routes?: RouteEntry[]
}

export interface RouteHandler {
  (request: RequestLike, ...args: any): any
}

export interface RouteEntry {
  0: string
  1: RegExp
  2: RouteHandler[]
}

export type Route = (
  path: string,
  ...handlers: RouteHandler[]
) => RouterType

export type RouterTraps = {
  [key: string]: Route
}

export type RouterType = {
  routes: RouteEntry[],
  handle: (request: RequestLike, ...extra: any) => Promise<any>
} & RouterTraps

let url = new URL('https://foo.bar?name=Kevin&age=14&pet=Katiya&pet=Vlad&pet=Halsey')

const toQuery = (params) =>
  [...params.entries()].reduce((acc, [k, v]) =>
    (acc[k] === undefined
            ? acc[k] = v
            : acc[k] = [...[acc[k]], v].flat()
    ) && acc
  , {})

export function Router({ base = '', routes = [] }: RouterOptions = {}): RouterType {
  return {
    __proto__: new Proxy({}, {
      get: (target, prop: string, receiver) => (route, ...handlers) =>
        routes.push([
          prop.toUpperCase(),
          RegExp(`^${(base + route)
            .replace(/(\/?)\*/g, '($1.*)?')                             // trailing wildcard
            .replace(/(\/$)|((?<=\/)\/)/, '')                           // remove trailing slash or double slash from joins
            .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')         // named params
            .replace(/\.(?=[\w(])/, '\\.')                              // dot in path
            .replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.') // optional image format
          }/*$`),
          handlers,
        ]) && receiver
    }),
    routes,
    async handle (request, ...args) {
      let response, match, url = new URL(request.url)
      request.query = toQuery(url.searchParams)
      for (let [method, route, handlers] of routes) {
        if ((method === request.method || method === 'ALL') && (match = url.pathname.match(route))) {
          request.params = match.groups
          for (let handler of handlers) {
            if ((response = await handler(request.proxy || request, ...args)) !== undefined) return response
          }
        }
      }
    }
  }
}

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

// export interface RouteEntry extends Array<any> {
//   0: string
//   1: RegExp
//   2: RouteHandler[]
// }

export type RouteEntry = [string, RegExp, RouteHandler[]]

export type Route = (
  path: string,
  ...handlers: RouteHandler[]
) => RouterType

export type RouterTraps = {
  get?: Route,
  post?: Route,
}

export type RouterType = {
  __proto__: RouterType,
  routes: RouteEntry[],
  handle: (request: RequestLike, ...extra: any) => Promise<any>
} & RouterTraps

// helper function to translate query params
const toQuery = (params) =>
  [...params.entries()].reduce((acc, [k, v]) =>
    (acc[k] === undefined
            ? acc[k] = v
            : acc[k] = [...[acc[k]], v].flat()
    ) && acc
  , {})

// the actual router
export function Router({ base = '', routes = [] }: RouterOptions = {}): RouterType {
  return {
    __proto__: new Proxy({} as RouterType, {
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

// const router = Router()
// router.routes.push(['GET', /gsadfa/, []])

// type MyTraps = {
//   foo?: Route;
// }

// const router = Router() as RouterType & MyTraps;


/*

{
  name: string,
  age: number,
  handler: (name: string) => any,

  ?? => Route
  ?? => Route
  ?? => Route
}


*/

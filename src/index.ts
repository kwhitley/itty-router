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

export interface RouterOptions {
  base?: string
  routes?: RouteEntry[]
}

export interface RouteHandler {
  (request: IRequest, ...args: any): any
}

export type RouteEntry = [string, RegExp, RouteHandler[]]

export type Route = <T extends RouterType>(
  path: string,
  ...handlers: RouteHandler[]
) => T

export type RouterHints = {
  all: Route,
  delete: Route,
  get: Route,
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

export const Router = ({ base = '', routes = [] }: RouterOptions = {}): RouterType =>
  // @ts-expect-error TypeScript doesn't know that Proxy makes this work
  ({
    __proto__: new Proxy({} as RouterType, {
      get: (target, prop: string, receiver) => (route: string, ...handlers: RouteHandler[]) =>
        routes.push([
          prop.toUpperCase(),
            // RegExp(`^${(base + route)
            // .replace(/(\/?)\*/g, '($1.*)?')                             // trailing wildcard
            // .replace(/(\/$)|((?<=\/)\/)/, '')                           // remove trailing slash or double slash from joins
            // .replace(/(:(\w+)\+)/, '(?<$2>.*)')                         // greedy params
            // .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')         // named params
            // .replace(/\.(?=[\w(])/, '\\.')                              // dot in path
            // .replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.') // optional image format

            // @DrLoopFall Regex - waiting for him to PR so he can get full credit for this!
            RegExp(`^${(base + '/' + route)
            .replace(/\/+(\/|$)/g, '$1')                       // remove multiple/trailing slash
            .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')      // greedy params
            .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))') // named params and image format
            .replace(/\./g, '\\.')                             // dot in path
            .replace(/(\/?)\*/g, '($1.*)?')                    // wildcard
          }/*$`),
          handlers,
        ]) && receiver
    }),
    routes,
    async handle (request: RequestLike, ...args)  {
      let response, match, url = new URL(request.url), query: any = request.query = {}
      for (let [k, v] of url.searchParams) {
        query[k] = query[k] === undefined ? v : [query[k], v].flat()
      }
      for (let [method, route, handlers] of routes) {
        if ((method === request.method || method === 'ALL') && (match = url.pathname.match(route))) {
          request.params = match.groups || {}
          for (let handler of handlers) {
            if ((response = await handler(request.proxy || request, ...args)) !== undefined) return response
          }
        }
      }
    }
  })

export * from './extras'

// type CustomMethods = {
//   foo?: Route,
//   bar?: Route,
// }

// // const router = Router() as RouterType & CustomMethods

// // router.foo()


// type RequestWithAuthors = {
//   authors?: string[]
// } & IRequest

// // middleware: adds authors to the request
// const addAuthors = (request) => {
//   request.authors = ['foo', 'bar']
// }


// const router = Router()

// type BooksResponse = {
//   books: string[]
// }

// // FAILING EXAMPLE
// router.get('books', (request): BooksResponse => {
//   request.foo = 'asd'

//   return false // fails to return a Response with books
// })

// // PASSING EXAMPLE
// router.get('books', (request): BooksResponse => {
//   request.foo = 'asd'

//   return {
//     books: ['foo', 'bar'] // passes!
//   }
// })

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

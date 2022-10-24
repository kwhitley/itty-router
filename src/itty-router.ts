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

export type RouteEntry = [string, RegExp, RouteHandler[]]

export type Route = (
  path: string,
  ...handlers: RouteHandler[]
) => RouterType

export type RouterTraps = {
  all?: Route,
  delete?: Route,
  get?: Route,
  options?: Route,
  patch?: Route,
  post?: Route,
  put?: Route,
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
    ) && acc || acc, {})

// the actual router
// export function Router({ base = '', routes = [] }: RouterOptions = {}): RouterType {
//   return {
//     __proto__: new Proxy({} as RouterType, {
//       get: (target, prop: string, receiver) => (route, ...handlers: RouteHandler[]) =>
//         routes.push([
//           prop.toUpperCase(),
//           RegExp(`^${(base + route)
//             .replace(/(\/?)\*/g, '($1.*)?')                             // trailing wildcard
//             .replace(/(\/$)|((?<=\/)\/)/, '')                           // remove trailing slash or double slash from joins
//             .replace(/(:(\w+)\+)/, '(?<$2>.*)')                         // greedy params
//             .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')         // named params
//             .replace(/\.(?=[\w(])/, '\\.')                              // dot in path
//             .replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.') // optional image format
//           }/*$`),
//           handlers,
//         ]) && receiver
//     }),
//     routes,
//     async handle (request, ...args)  {
//       let response, match, url = new URL(request.url)
//       request.query = toQuery(url.searchParams)
//       for (let [method, route, handlers] of routes) {
//         if ((method === request.method || method === 'ALL') && (match = url.pathname.match(route))) {
//           request.params = match.groups
//           for (let handler of handlers) {
//             if ((response = await handler(request.proxy || request, ...args)) !== undefined) return response
//           }
//         }
//       }
//     }
//   }
// }

export const Router = ({ base = '', routes = [] }: RouterOptions = {}): RouterType =>
  ({
    __proto__: new Proxy({} as RouterType, {
      get: (target, prop: string, receiver) => (route, ...handlers: RouteHandler[]) =>
        routes.push([
          prop.toUpperCase(),
          RegExp(`^${(base + route)
            .replace(/(\/?)\*/g, '($1.*)?')                             // trailing wildcard
            .replace(/(\/$)|((?<=\/)\/)/, '')                           // remove trailing slash or double slash from joins
            .replace(/(:(\w+)\+)/, '(?<$2>.*)')                         // greedy params
            .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')         // named params
            .replace(/\.(?=[\w(])/, '\\.')                              // dot in path
            .replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.') // optional image format
          }/*$`),
          handlers,
        ]) && receiver
    }),
    routes,
    async handle (request, ...args)  {
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
  })


// type CustomMethods = {
//   foo?: Route,
//   bar?: Route,
// }

// // const router = Router() as RouterType & CustomMethods

// // router.foo()


// type RequestWithAuthors = {
//   authors?: string[]
// } & RequestLike

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

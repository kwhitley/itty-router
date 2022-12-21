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
    [key: string]: string | undefined,
  },
  proxy?: any,
} & GenericTraps

export interface RouterOptions<RequestType> {
  base?: string
  routes?: RouteEntry<RequestType>[]
}

export interface RouteHandler<RequestType> {
  (request: IRequest & RequestType, ...args: any): any
}

export type RouteEntry<RequestType> = [string, RegExp, RouteHandler<RequestType>[]]

export type Route<RequestType = RequestLike> = <T extends RouterType<RequestType>>(
  path: string,
  ...handlers: RouteHandler<RequestType>[]
) => T

export type RouterHints<RequestType> = {
  all: Route<RequestType>,
  delete: Route<RequestType>,
  get: Route<RequestType>,
  options: Route<RequestType>,
  patch: Route<RequestType>,
  post: Route<RequestType>,
  put: Route<RequestType>,
}

export type RouterType<RequestType = RequestLike> = {
  __proto__: RouterType<RequestType>,
  routes: RouteEntry<RequestType>[],
  handle: (request: RequestLike & RequestType, ...extra: any) => Promise<any>
} & RouterHints<RequestType>

// helper function to translate query params
const toQuery = (params: any) =>
  [...params.entries()].reduce((acc, [k, v]) =>
    (acc[k] === undefined
            ? acc[k] = v
            : acc[k] = [...[acc[k]], v].flat()
    ) && acc || acc, {})

export const Router = <RequestType = RequestLike>({ base = '', routes = [] }:
  RouterOptions<RequestType> = {}): RouterType<RequestType> =>
  // @ts-expect-error TypeScript doesn't know that Proxy makes this work
  ({
    __proto__: new Proxy({} as RouterType<RequestType>, {
      get: (target, prop: string, receiver) => (route: string, ...handlers: RouteHandler<RequestType>[]) =>
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
    async handle (request: RequestLike, ...args)  {
      let response, match, url = new URL(request.url)
      request.query = toQuery(url.searchParams)
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

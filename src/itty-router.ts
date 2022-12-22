type None = {}

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

export interface RouterOptions<RequestProperties> {
  base?: string
  routes?: RouteEntry<RequestProperties>[]
}

export interface RouteHandler<RequestProperties> {
  (request: IRequest & RequestProperties, ...args: any): any
}

export type RouteEntry<RequestProperties> = [string, RegExp, RouteHandler<RequestProperties>[]]

export type Route<RequestProperties = None, CustomMethods = None> = <T
  extends RouterType<RequestProperties, CustomMethods>>(
    path: string,
    ...handlers: RouteHandler<RequestProperties>[]
  ) => T

export type RouterHints<RequestProperties, CustomMethods> = {
  all: Route<RequestProperties, CustomMethods>,
  delete: Route<RequestProperties, CustomMethods>,
  get: Route<RequestProperties, CustomMethods>,
  options: Route<RequestProperties, CustomMethods>,
  patch: Route<RequestProperties, CustomMethods>,
  post: Route<RequestProperties, CustomMethods>,
  put: Route<RequestProperties, CustomMethods>,
} & CustomMethods

export type RouterType<RequestProperties = None, CustomMethods = None> = {
  __proto__: RouterType<RequestProperties, CustomMethods>,
  routes: RouteEntry<RequestProperties>[],
  handle: (request: RequestLike & RequestProperties, ...extra: any) => Promise<any>
} & RouterHints<RequestProperties, CustomMethods>

// helper function to translate query params
const toQuery = (params: any) =>
  [...params.entries()].reduce((acc, [k, v]) =>
    (acc[k] === undefined
            ? acc[k] = v
            : acc[k] = [...[acc[k]], v].flat()
    ) && acc || acc, {})

export const Router = <RequestProperties = None, CustomMethods = None>({ base = '', routes = [] }:
  RouterOptions<RequestProperties> = {}): RouterType<RequestProperties, CustomMethods> =>
  // @ts-expect-error TypeScript doesn't know that Proxy makes this work
  ({
    __proto__: new Proxy({} as RouterType<RequestProperties, CustomMethods>, {
      get: (target, prop: string, receiver) => (route: string, ...handlers: RouteHandler<RequestProperties>[]) =>
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

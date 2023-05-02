export type GenericTraps = {
  [key: string]: any;
};

export type RequestLike = {
  method: string;
  url: string;
} & GenericTraps;

type Modifier = '?' | '+';
type EatModifiers<Input extends string> = Input extends `${infer Remainder}${Modifier}`
  ? EatModifiers<Remainder>
  : Input;

type CleanRouteParameters<Params extends { [key: string]: any }> = {
  [Entry in keyof Params as Entry extends string ? EatModifiers<Entry> : Entry]: Params[Entry];
};

type UnknownRouteParameters = { [key: string]: string | undefined };

type InferParameterType<Entry> = string | (Entry extends `${string}${Modifier}` ? undefined : never);

type InferRouteParameters<Route> = Route extends `${string}/:${infer Param}/${infer Rest}*`
  ? {
      [Entry in Param | keyof InferRouteParameters<`/${Rest}`>]: InferParameterType<Entry>;
    } & UnknownRouteParameters
  : Route extends `${string}/:${infer Param}*`
  ? {
      [Entry in Param]: InferParameterType<Entry>;
    } & UnknownRouteParameters
  : Route extends `${string}*`
  ? UnknownRouteParameters
  : Route extends `${string}/:${infer Param}/${infer Rest}`
  ? {
      [Entry in Param | keyof InferRouteParameters<`/${Rest}`>]: InferParameterType<Entry>;
    }
  : Route extends `${string}/:${infer Param}`
  ? { [Entry in Param]: InferParameterType<Entry> }
  : {};

export type ParseRouteParameters<Route> = CleanRouteParameters<InferRouteParameters<Route>>;

export type IRequest<TBaseRoute extends string | undefined = undefined, TRoute extends string = string> = {
  method: string;
  url: string;
  params: string | undefined extends TRoute
    ? UnknownRouteParameters
    : ParseRouteParameters<`${TBaseRoute extends `/${string}` ? TBaseRoute : ''}${TRoute}`>;
  query: {
    [key: string]: string | string[] | undefined;
  };
  proxy?: any;
} & GenericTraps;

export interface RouterOptions<TBaseRoute extends string | undefined> {
  base?: TBaseRoute;
  routes?: RouteEntry[];
}

export interface RouteHandler<TBaseRoute extends string | undefined = undefined, TRoute extends string = string> {
  (request: IRequest<TBaseRoute, TRoute>, ...args: any): any;
}

export type RouteEntry = [string, RegExp, RouteHandler[]];

type ExtractBaseRoute<T extends RouterType> = T extends RouterType<infer TBaseRoute> ? TBaseRoute : undefined;

export type Route = <T extends RouterType, TRoute extends string = string, TBaseRoute extends string | undefined = ExtractBaseRoute<T>>(
  this: T,
  path: TRoute,
  ...handlers: RouteHandler<TBaseRoute, TRoute>[]
) => T;

export type RouterHints = {
  all: Route;
  delete: Route;
  get: Route;
  options: Route;
  patch: Route;
  post: Route;
  put: Route;
};

export type RouterType<TBaseRoute extends string | undefined = undefined, TMethods extends string | undefined = undefined> = {
  __proto__: RouterType<TBaseRoute>;
  routes: RouteEntry[];
  handle: (request: RequestLike, ...extra: any) => Promise<any>;
} & RouterHints & ( TMethods extends string ? Record<TMethods, Route> : {});

export const Router = <
  TBaseRoute extends string | undefined,
  TMethods extends string | undefined = undefined,
>({ base = '', routes = [] }: RouterOptions<TBaseRoute> = {}): RouterType<TBaseRoute, TMethods> =>
  // @ts-expect-error TypeScript doesn't know that Proxy makes this work
  ({
    __proto__: new Proxy({} as RouterType<TBaseRoute>, {
      get: (target, prop: string, receiver) => (route: string, ...handlers: RouteHandler[]) =>
        routes.push([
          prop.toUpperCase(),
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

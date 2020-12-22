interface RouteHandler<TRequest> {
  (request: TRequest & Request, ...args: any): any
}

interface Route {
  <TRequest>(path: string, ...handlers: RouteHandler<TRequest & Request>[]): Router
}

type Obj = {
  [propName: string]: string
}

interface Request {
  method?: string
  url: string
  params?: Obj
  query?: Obj
}

type Router = {
  handle: (request: Request, ...extra: any) => any
} & {
  [any:string]: Route
}

interface RouterOptions {
  base?: string
}

export function Router(options?:RouterOptions): Router

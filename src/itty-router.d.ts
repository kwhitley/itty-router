interface RouteHandler<TRequest> {
  (request: TRequest & Request): any
}

interface Route {
  <TRequest>(path: string, ...handlers: RouteHandler<TRequest & Request>[]): Router
}

interface Request {
  method?: string
  url: string
}

interface Router {
  handle: (request: Request) => any
  [any:string]: Route
}

interface RouterOptions {
  base?: string
}

export function Router(options?:RouterOptions): Router

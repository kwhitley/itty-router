export type Obj = {
  [propName: string]: string
}

export interface RouteHandler<TRequest> {
  (request: TRequest, ...args: any): any
}

export interface Route<TRequest = Request, TMethods = {}> {
  <RRequest>(path: string, ...handlers: RouteHandler<RRequest & TRequest & Request>[]): Router<TRequest, TMethods>
}

export interface RouteEntry<TRequest> {
  0: string
  1: RegExp
  2: RouteHandler<TRequest>[]
}

export interface Request {
  method: string
  params?: Obj
  query?: Obj
  url: string

  arrayBuffer?(): Promise<any>
  blob?(): Promise<any>
  formData?(): Promise<any>
  json?(): Promise<any>
  text?(): Promise<any>
}

export interface IHTTPMethods<TRequest = Request> {
  get: Route<TRequest, IHTTPMethods>
  head: Route<TRequest, IHTTPMethods>
  post: Route<TRequest, IHTTPMethods>
  put: Route<TRequest, IHTTPMethods>
  delete: Route<TRequest, IHTTPMethods>
  connect: Route<TRequest, IHTTPMethods>
  options: Route<TRequest, IHTTPMethods>
  trace: Route<TRequest, IHTTPMethods>
  patch: Route<TRequest, IHTTPMethods>
}

export type Router<TRequest = Request, TMethods = {}> = {
  handle: (request: TRequest, ...extra: any) => Promise<any>
  routes: RouteEntry<TRequest>[]
  all: Route<TRequest, TMethods>
} & TMethods & {
  [any:string]: Route<TRequest, TMethods>
}

export interface RouterOptions<TRequest> {
  base?: string
  routes?: RouteEntry<TRequest>[]
}

export function Router<TRequest = Request, TMethods = {}>(options?:RouterOptions<TRequest>): Router<TRequest, TMethods>

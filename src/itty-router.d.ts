export type Obj = {
  [propName: string]: string
}

export interface RouteHandler<TRequest> {
  (request: TRequest, ...args: any): any
}

export interface Route<TRequest = Request> {
  <RRequest>(path: string, ...handlers: RouteHandler<RRequest & TRequest & Request>[]): Router<TRequest>
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
  get: Route<TRequest>
  head: Route<TRequest>
  post: Route<TRequest>
  put: Route<TRequest>
  delete: Route<TRequest>
  connect: Route<TRequest>
  options: Route<TRequest>
  trace: Route<TRequest>
  patch: Route<TRequest>
}

export type Router<TRequest = Request, TMethods = {}> = {
  handle: (request: TRequest, ...extra: any) => Promise<any>
  routes: RouteEntry<TRequest>[]
  all: Route<TRequest>
} & TMethods & {
  [any:string]: Route<TRequest>
}

export interface RouterOptions<TRequest> {
  base?: string
  routes?: RouteEntry<TRequest>[]
}

export function Router<TRequest = Request, TMethods = {}>(options?:RouterOptions<TRequest>): Router<TRequest, TMethods>

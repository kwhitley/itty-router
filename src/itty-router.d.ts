export type Obj = {
  [propName: string]: string
}

export interface RouteHandler<TRequest> {
  (request: TRequest & Request, ...args: any): any
}

export interface Route {
  <TRequest>(path: string, ...handlers: RouteHandler<TRequest & Request>[]): Router
}

export interface Request {
  method?: string
  params?: Obj
  query?: Obj
  url: string

  arrayBuffer?(): Promise
  blob?(): Promise
  formData?(): Promise
  json?(): Promise
  text?(): Promise
}

export type Router = {
  handle: (request: Request, ...extra: any) => any
} & {
  [any:string]: Route
}

export interface RouterOptions {
  base?: string
  r?: any[]
}

export function Router(options?:RouterOptions): Router

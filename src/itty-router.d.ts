export type Obj = {
  [propName: string]: string
}

export interface RouteHandler<TRequest> {
  (request: TRequest & Request, ...args: any): any
}

export interface Route {
  <TRequest>(path: string, ...handlers: RouteHandler<TRequest & Request>[]): Router<TRequest>
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

export type Router<TRequest> = {
  handle: (request: Request, ...extra: any) => any
  routes: RouteEntry<TRequest>[]
} & {
  [any:string]: Route
}

export interface RouterOptions<TRequest> {
  base?: string
  routes?: RouteEntry<TRequest>[]
}

export function Router<TRequest>(options?:RouterOptions<TRequest>): Router<TRequest>

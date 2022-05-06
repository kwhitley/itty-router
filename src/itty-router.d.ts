/// <reference lib="dom" />

export type Obj = {
  [propName: string]: string
}

export interface RouteHandler<TRequest> {
  (request: TRequest, ...args: any): any
}

export interface Route {
  <TRequest>(path: string, ...handlers: RouteHandler<TRequest & IttyRequest>[]): Router<TRequest>
}

export interface RouteEntry<TRequest> {
  0: string
  1: RegExp
  2: RouteHandler<TRequest>[]
}

export interface IHTTPMethods {
  get: Route
  head: Route
  post: Route
  put: Route
  delete: Route
  connect: Route
  options: Route
  trace: Route
  patch: Route
}

interface IttyRequest extends Request {
  params?: {
    [key: string]: string
  }
  proxy?: object
  query?: {
    [k: string]: string | undefined
  }
}

export type Router<TRequest = IttyRequest, TMethods = {}> = {
  handle: (request: TRequest, ...extra: any) => Promise<any>
  routes: RouteEntry<TRequest>[]
  all: Route
} & TMethods & {
  [any:string]: Route
}

export interface RouterOptions<TRequest> {
  base?: string
  routes?: RouteEntry<TRequest>[]
}

export function Router<TRequest = IttyRequest, TMethods = {}>(options?:RouterOptions<TRequest>): Router<TRequest, TMethods>
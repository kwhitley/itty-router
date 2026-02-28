import { Router } from './Router'
import { error } from './error'
import { json } from './json'
import type { CorsPair } from './cors'
import { AutoRouterOptions, AutoRouterType, IRequest } from './types'

export const AutoRouter = <
  RequestType extends IRequest = IRequest,
  Args extends any[] = any[],
  ResponseType = any
>({
  cors: c,
  format = json,
  notFound = () => error(404),
  before: b = [],
  after: f = [],
  ...options }: AutoRouterOptions<RequestType, Args> & { cors?: CorsPair } = {}
) => Router<RequestType, Args, ResponseType>({
  // @ts-ignore
  catch: error,
  before: [...(c ? [c.preflight] : []), ...b],
  after: [
    // @ts-ignore
    (r: any, ...args) => r ?? notFound(...args),
    format,
    ...(c ? [c.corsify] : []),
    ...f,
  ],
  ...options,
}) as AutoRouterType<RequestType, Args, ResponseType>

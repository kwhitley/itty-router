import { Router } from './Router'
import { error } from './error'
import { json } from './json'
import { AutoRouterOptions, AutoRouterType, IRequest } from './types'

export const AutoRouter = <
  RequestType extends IRequest = IRequest,
  Args extends any[] = any[],
  ResponseType = any
>({
  format = json,
  missing = () => error(404),
  finally: f = [],
  ...options }: AutoRouterOptions<RequestType, Args> = {}
) => Router<RequestType, Args, ResponseType>({
  // @ts-ignore
  catch: error,
  finally: [
    // @ts-ignore
    (r: any, ...args) => r ?? missing(...args),
    format,
    ...f,
  ],
  ...options,
}) as AutoRouterType<RequestType, Args, ResponseType>

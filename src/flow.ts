import { IRequest, RequestLike, RouteHandler, RouterType } from './Router'
import { CorsOptions, createCors } from './createCors'
import { error } from './error'
import { json } from './json'
import { withParams } from './withParams'

type anyFunction = (...args: any) => any
type afterFunction<Res = any, Req = IRequest, Args = any[]> = {
  // @ts-expect-error - TS never likes this syntax
  (response: Res, request: Req, ...args: Args): any
}

export type FlowOptions = {
  cors?: CorsOptions | true
  errors?: anyFunction | false
  format?: anyFunction | false
  notFound?: anyFunction | false

  // proposed/under discussion
  before?: RouteHandler
  after?: afterFunction
}

export type Flowed = (request: RequestLike, ...extra: any[]) => Promise<any>
export type FlowedAndFetch = Flowed & { fetch: Flowed }

export const flow = (router: RouterType, options: FlowOptions = {}): FlowedAndFetch => {
  const {
    format = json,
    cors,
    errors = error,
    notFound = () => error(404),
    after,
    before,
  } = options

  // @ts-expect-error - come on, TS...
  const { preflight, corsify } = cors ? createCors(cors === true ? undefined : cors) : {}

  // register a notFound route, if given
  notFound && router.all('*', notFound)

  const beforeHandlers = [withParams]

  // add preflight if cors enabled
  cors && beforeHandlers.push(preflight)

  // then add upstream middleware
  router.routes.unshift(['ALL', /^(.*)?\/*$/, beforeHandlers, '*'])

  const flowed = async (...args: any[]) => {
    // @ts-expect-error - if before function is defined, await it
    before && await before(...args)

    // @ts-expect-error - itty types don't like this
    let response = router.handle(...args)

    // handle formatting, if given
    response = response.then(v => format && v !== undefined ? format?.(v) : v)

    // handle errors if error handler given
    response = errors ? response.catch(errors) : response

    // handle cors if cors enabled
    response = cors ? response.then(corsify) : response

    // @ts-expect-error - if after function is defined, await it
    return (await after?.(await response, ...args)) ?? response
  }

  // support flow(router) === { fetch: flow(router) } signature
  return flowed.fetch = flowed
}

import { IRequest, RequestLike, RouteHandler, RouterType } from './Router'
import { CorsFns, CorsOptions, createCors } from './createCors'
import { error } from './error'
import { json } from './json'
import { withParams } from './withParams'

type anyFunction = (...args: any) => any
type afterFunction<Res = any, Req = IRequest, Args extends Array<any> = any[]> = {
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

  const { preflight, corsify }: Partial<CorsFns> = cors ? createCors(cors === true ? undefined : cors) : {}

  // register a notFound route, if given
  notFound && router.all('*', notFound)

  const beforeHandlers = [withParams]

  // add preflight if cors enabled
  cors && beforeHandlers.push(preflight)

  // then add upstream middleware
  router.routes.unshift(['ALL', /^(.*)?\/*$/, beforeHandlers, '*'])

  const flowed: RouteHandler = async (req, ...args: any[]) => {
    before && await before(req, ...args)

    let response = router.handle(req, ...args)

    // handle formatting, if given
    response = response.then(v => format && v !== undefined ? format?.(v) : v)

    // handle errors if error handler given
    response = errors ? response.catch(errors) : response

    // handle cors if cors enabled
    response = cors ? response.then(corsify) : response

    return (await after?.(await response, req, ...args)) ?? response
  }

  // support flow(router) === { fetch: flow(router) } signature
  return flowed.fetch = flowed
}

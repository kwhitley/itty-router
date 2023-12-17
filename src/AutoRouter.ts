import { Router, IRequest, RouteHandler, RouterType, RouterOptions } from './Router'
import { CorsHandlers, CorsOptions, createCors } from './createCors'
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
} & RouterOptions

export type AUtoRouterType = RouterType

export const AutoRouter = (options: FlowOptions = {}): AUtoRouterType => {
  const {
    format = json,
    cors,
    errors = error,
    notFound = () => error(404),
    after,
    before,
  } = options

  const router = Router(options)

  const { preflight, corsify }: Partial<CorsHandlers> = cors ? createCors(cors === true ? undefined : cors) : {}

  // register a notFound route, if given
  // notFound && router.all('*', notFound)

  const beforeHandlers = [withParams]

  // // add preflight if cors enabled
  cors && beforeHandlers.push(preflight)

  // // then add upstream middleware
  router.routes.unshift(['ALL', /^(.*)?\/*$/, beforeHandlers, '*'])

  // preserve original handle
  const originalHandle = router.handle

  router.handle = async (req, ...args: any[]) => {
    // @ts-expect-error
    before && await before(req, ...args)

    let response = originalHandle(req, ...args)

    response = response.then(v => v !== undefined ? (format ? format(v) : v) : notFound ? notFound(v) : v)

    // handle errors if error handler given
    response = errors ? response.catch(errors) : response

    // handle cors if cors enabled
    response = cors ? response.then(corsify) : response

    return (await after?.(await response, req, ...args)) ?? response
  }

  router.fetch = router.handle

  // support flow(router) === { fetch: flow(router) } signature
  return router
}

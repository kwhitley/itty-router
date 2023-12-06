import { RouterType } from './Router'
import { CorsOptions, createCors } from './createCors'
import { error } from './error'
import { json } from './json'
import { withParams } from './withParams'

type anyFunction = (...args: any) => any

export type FlowOptions = {
  cors?: CorsOptions | true
  errors?: anyFunction | false
  format?: anyFunction | false
  notFound?: anyFunction | false

  // proposed/under discussion
  before?: anyFunction[]
  after?: anyFunction[]
  logging?: anyFunction
}

export const flow = (router: RouterType, options: FlowOptions = {}) => {
  const {
    format = json,
    cors,
    errors = error,
    notFound = () => error(404),
  } = options
  let corsHandlers: any

  // register a notFound route, if given
  if (typeof notFound === 'function') {
    router.all('*', notFound)
  }

  // Initialize CORS handlers if cors options are provided
  if (cors) {
    corsHandlers = createCors(cors === true ? undefined : cors)
    router.routes.unshift(['ALL', /^(.*)?\/*$/, [corsHandlers.preflight, withParams], '*'])
  }

  const flowed = async (...args: any[]) => {
    // @ts-expect-error - itty types don't like this
    let response = router.handle(...args)
    response = response.then(v => format && v !== undefined ? format?.(v) : v)
    response = errors ? response.catch(errors) : response

    // add optional cors and return response
    return cors ? response.then(corsHandlers?.corsify) : response
  }

  // support flow(router) === { fetch: flow(router) } signature
  flowed.fetch = flowed

  return flowed
}

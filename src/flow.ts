import { RouteHandler, RouterType } from './Router'
import { CorsOptions, createCors } from './createCors'
import { error } from './error'
import { json } from './json'
import { withParams } from './withParams'

export type FlowOptions = {
  cors?: CorsOptions | true
  errors?: Function | false
  format?: Function | false
  notFound?: RouteHandler | false
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

  return async (...args: any[]) => {
    // @ts-expect-error
    let response = router.handle(...args)
    // @ts-expect-error - add optional formatting
    response = format ? response.then(format) : response
    // @ts-expect-error - add optional error handling
    response = errors ? response.catch(errors) : response

    // add optional cors and return response
    return cors ? response.then(corsHandlers?.corsify) : response
  }
}

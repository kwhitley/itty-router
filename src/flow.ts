import { RouteHandler, RouterType } from './Router'
import { CorsOptions, createCors } from './createCors'
import { error } from './error'
import { json } from './json'
import { withParams } from './withParams'

export type FlowOptions = {
  format?: Function | false
  error?: Function | false
  notFound?: RouteHandler | false
  cors?: CorsOptions | true
}

export const flow = (router: RouterType, options: FlowOptions = {}) => {
  const {
    format = json,
    error: errorHandler = error,
    cors,
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

    if (format) {
      // @ts-expect-error - add formatting, if provided
      response = response.then(format)
    }

    if (errorHandler) {
      // @ts-expect-error - add error handling, if provided
      response = response.catch(errorHandler)
    }

    // add final CORS pass, if enabled
    if (cors) {
      response = response.then(corsHandlers?.corsify)
    }

    // finally, return the response
    return response
  }
}

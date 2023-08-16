import { RouterType, RouteHandler } from './Router'
import { error } from './error'
import { json } from './json'
import { CorsOptions, createCors } from './createCors'

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
    router.routes.unshift(['ALL', /^(.*)?\/*$/, [corsHandlers.preflight], '*'])
  }

  return async (...args: any[]) => {
    // @ts-expect-error
    let response = router.handle(...args)

    // add formatting, if provided
    if (format) {
      response = response.then(format)
    }

    // add error handling, if provided
    if (errorHandler) {
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

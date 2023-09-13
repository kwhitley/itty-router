import { RouteHandler, RouterType } from './Router'
import { CorsOptions, createCors } from './createCors'
import { error } from './error'
import { json } from './json'
import { withParams } from './withParams'

export type FlowOptions = {
  format?: Function | false
  handleErrors?: Function | false
  handleNotFound?: RouteHandler | false
  cors?: CorsOptions | true
}

export const flow = (router: RouterType, options: FlowOptions = {}) => {
  const {
    format = json,
    cors,
    handleErrors = error,
    handleNotFound = () => error(404),
  } = options
  let corsHandlers: any

  // register a notFound route, if given
  if (typeof handleNotFound === 'function') {
    router.all('*', handleNotFound)
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
    response = handleErrors ? response.catch(handleErrors) : response

    // add optional cors and return response
    return cors ? response.then(corsHandlers?.corsify) : response
  }
}

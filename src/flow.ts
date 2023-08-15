import { RouterType, RouteHandler } from './Router'
import { error } from './error'
import { json } from './json'
import { CorsOptions, createCors } from './createCors'

export type FlowOptions = {
  format?: Function
  error?: Function
  notFound?: boolean | RouteHandler
  cors?: CorsOptions
}

export const flow = (router: RouterType, options: FlowOptions = {}) => {
  const {
    format = json,
    cors,
    notFound = () => error(404),
  } = options

  // register a notFound route, if given
  if (typeof notFound === 'function') {
    router.all('*', notFound)
  }

  if (!cors) return (...args: any[]) => router
                                          // @ts-expect-error
                                          .handle(...args)
                                          // @ts-expect-error
                                          .then(format)
                                          // @ts-expect-error
                                          .catch(options.error || error)

  // handle CORS if defined
  const { preflight, corsify } = createCors(cors)
  router.routes.unshift(['ALL', /^(.*)?\/*$/, [preflight], '*'])

  return (...args: any[]) => router
                              // @ts-expect-error
                              .handle(...args)
                              // @ts-expect-error
                              .then(format)
                              // @ts-expect-error
                              .catch(options.error || error)
                              .then(corsify)
}

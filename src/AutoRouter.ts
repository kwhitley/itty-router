import { RouteHandler } from 'IttyRouter'
import { ResponseHandler, Router, RouterOptions } from './Router'
import { error } from './error'
import { json } from './json'
import { withParams } from './withParams'

type AutoRouterOptions = {
  missing?: RouteHandler
  format?: ResponseHandler
} & RouterOptions

// MORE FINE-GRAINED/SIMPLIFIED CONTROL, BUT CANNOT FULLY REPLACE BEFORE/FINALLY STAGES
export const AutoRouter = ({
  format = json,
  missing = () => error(404),
  finally: f = [],
  before = [],
  ...options }: AutoRouterOptions = {}
) => Router({
  before: [
    withParams,
    ...before
  ],
  catch: error,
  finally: [
    (r: any, ...args) => r ?? missing(r, ...args),
    format,
    ...f,
  ],
  ...options,
})

// LESS FINE-GRAINED CONTROL, BUT CAN COMPLETELY REPLACE BEFORE/FINALLY STAGES
// export const AutoRouter2 = ({ ...options }: RouterOptions = {}) => Router({
//   before: [withParams],
//   onError: [error],
//   finally: [
//     (r: any) => r ?? error(404),
//     json,
//   ],
//   ...options,
// })

import { error } from './error'
import { json } from './json'
import { withParams } from './withParams'
import { Router, RouterOptions} from './Router'

// MORE FINE-GRAINED/SIMPLIFIED CONTROL, BUT CANNOT FULLY REPLACE BEFORE/AFTER STAGES
export const AutoRouter = ({
  format = json,
  missing = () => error(404),
  after = [],
  before = [],
  ...options }: RouterOptions = {}
) => Router({
  before: [
    withParams,
    ...before
  ],
  onError: [error],
  after: [
    // @ts-ignore
    (r: any, ...args) => r ?? missing(r, ...args),
    format,
    ...after,
  ],
  ...options,
})

// LESS FINE-GRAINED CONTROL, BUT CAN COMPLETELY REPLACE BEFORE/AFTER STAGES
// export const AutoRouter2 = ({ ...options }: RouterOptions = {}) => Router({
//   before: [withParams],
//   onError: [error],
//   after: [
//     (r: any) => r ?? error(404),
//     json,
//   ],
//   ...options,
// })

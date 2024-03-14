import { error } from 'error'
import { json } from 'json'
import { withParams } from 'withParams'
import { Router, RouterOptions} from './Router'

export const AutoRouter = (options?: RouterOptions) => Router({
  before: [withParams],
  onError: [error],
  after: [json],
  missing: () => error(404, 'Are you sure about that?'),
  ...options,
})

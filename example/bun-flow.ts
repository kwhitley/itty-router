// WITH FLOW
import { Router, flow } from '../src'

const router = Router()

router
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))

export default flow(router)

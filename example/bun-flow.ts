// WITH FLOW
import { Router, flow } from 'itty-router'

const router = Router()

router
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))

export default {
  port: 3001,
  fetch: flow(router),
}

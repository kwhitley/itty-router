// WITH FLOW (overriding options, and enabling CORS)
import { Router, error, flow } from 'itty-router'

const router = Router()

router
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))

export default {
  port: 3001,
  fetch: flow(router, {
    cors: {
      methods: ['GET', 'POST', 'PATCH'],
    },
    notFound: () => error(404, 'Are you sure about that?'),
  }),
}

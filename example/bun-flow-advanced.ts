// WITH FLOW (overriding options, and enabling CORS)
import { Router, error, flow } from '../src'

const router = Router()

router
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))

export default flow(router, {
  cors: {
    methods: ['GET', 'POST', 'PATCH'],
  },
  notFound: () => error(404, 'Are you sure about that?'),
})

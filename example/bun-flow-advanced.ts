// WITH FLOW (overriding options, and enabling CORS)
import { Router, error, flow } from '../src'

const router = Router()

router
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))

export default flow(router, {
  after: (response, request) => {
    const { method, start } = request
    const { status } = response
    const duration = Date.now() - start
    const url = new URL(request.url)
    console.log(`${status} ${method} ${url.pathname+(url.search || '')} - ${duration}ms`)
  },
  before: (request) => request.start = Date.now(),
  cors: {
    methods: ['GET', 'POST', 'PATCH'],
  },
  notFound: () => error(404, 'Are you sure about that?'),
})

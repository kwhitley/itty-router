// WITH FLOW (overriding options, and enabling CORS)
import { Router, error, flow } from '../src'
import { IRequest, IRequestStrict } from '../src'

type Env = {
  KV: object
}

type CustomRequest = {
  foo: string
} & IRequestStrict

type RouterArgs = [env: Env]

const router = Router()

router
  .all('*', (request) => { request.start = Date.now() })
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))

export default flow(router, {
  before: (request) => request.start = Date.now(),
  after: (response, request) => {
    const { method, start } = request
    const { status } = response
    const duration = Date.now() - start
    const url = new URL(request.url)
    console.log(`${status} ${method} ${url.pathname+(url.search || '')} - ${duration}ms`)
  },
  cors: true,
  notFound: () => error(404, 'Are you sure about that?'),
})

const flowed = flow(router)

flowed.fetch()

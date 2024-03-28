import { AutoRouter } from '../src/AutoRouter'
import { IRequest, IRequestStrict, RequestHandler } from '../src/IttyRouter'
import { ResponseHandler } from '../src/Router'

type BenchmarkedRequest = {
  start: number
} & IRequestStrict

const withBenchmarking: RequestHandler<BenchmarkedRequest> = (request) => {
  request.start = Date.now()
}

const logger: ResponseHandler<Response, BenchmarkedRequest> = (response, request) => {
  console.log(response.status, request.url, 'served in', Date.now() - request.start, 'ms')
}

const router = AutoRouter({
  port: 3001,
  before: [withBenchmarking, () => {}],
  finally: [logger, () => {}],
})

router
  .get('/basic', () => new Response('Success!'))
  .get('/text', () => 'Success!')
  .get('/params/:foo', ({ foo }) => foo)
  .get('/json', () => ({ foo: 'bar' }))
  .get('/throw', (a) => a.b.c)

export default router

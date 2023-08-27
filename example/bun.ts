// WITHOUT FLOW
import { IRequest, Router, error, json, withParams } from 'itty-router'

const router = Router()

router
  .all('*', withParams)
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))
  .all('*', () => error(404))

export default {
  port: 3001,
  fetch: (request: IRequest) => router
                                  .handle(request)
                                  .then(json)
                                  .catch(error),
}

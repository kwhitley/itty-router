import { Router, error, json, withParams } from 'itty-router'

const router = Router()

router
  .all('*', withParams)
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))
  .all('*', () => error(404))

export default {
  port: 3001,
  fetch: (request, env, ctx) =>
    router.handle(request, env, ctx).then(json).catch(error),
}

import { Router, error, json, text, withParams } from '../src/index'

const router = Router({ port: 8080 })

router
  .all('*', withParams)
  .get('/test', () => text('Success!'))
  .get('/foo/:bar/:baz?', ({ bar, baz }) => json({ bar, baz }))
  .all('*', () => error(404, 'Are you sure about that?'))

export default router

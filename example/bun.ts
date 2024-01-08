import { Router, error, json, withParams } from '../src/index'

const router = Router({
  port: 3001,
  after: json,
  errors: error,
})

router
  .all('*', withParams)
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))
  .get('/throw', (a) => a.b.c) // this is caught!
  .all('*', () => error(404))

export default router

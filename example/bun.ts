import { Router, createCors, error, json, text, withParams } from '../src/index'

const { preflight, corsify } = createCors()

const router = Router({
  port: 3001,
  // after: json,
  after: r => corsify(json(r)),
  error,
})

router
  .all('*', withParams, preflight)
  .get('/test', () => text('Success!'))
  .post('/test', () => text('Post Success!'))
  .get('/foo/:bar/:baz?', ({ bar, baz }) => json({ bar, baz }))
  .get('/throw', (a) => a.b.c) // this is caught!
  .all('*', () => error(404))

export default router

import { Router, RouterType, error, json, withParams } from '../src/index'

const CustomRouter = (options = {}): RouterType =>
  Router({
    port: 3000,
    after: json,
    errors: error,
    ...options
  })

const router = CustomRouter()

router
  .all('*', withParams)
  .get('/test', () => 'Success!')
  .get('/foo/:bar/:baz?', ({ bar, baz }) => ({ bar, baz }))
  .get('/throw', (a) => a.b.c) // this is caught!
  .all('*', () => error(404))

export default router

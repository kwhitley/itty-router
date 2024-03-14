import { Router } from '../src/Router'
import { error } from '../src/error'
import { json } from '../src/json'
import { withParams } from '../src/withParams'

const router = Router({
  port: 3001,
  before: [withParams],
  onError: [error],
  after: [json],
})

router
  .get('/basic', () => new Response('Success!'))
  .get('/text', () => 'Success!')
  .get('/params/:foo', ({ foo }) => foo)
  .get('/json', () => ({ foo: 'bar' }))
  .get('/throw', (a) => a.b.c)
  .all('*', () => error(404))

export default router

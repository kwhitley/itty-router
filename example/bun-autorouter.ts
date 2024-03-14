import { AutoRouter } from '../src/AutoRouter'

const router = AutoRouter({ port: 3001 })

router
  .get('/basic', () => new Response('Success!'))
  .get('/text', () => 'Success!')
  .get('/params/:foo', ({ foo }) => foo)
  .get('/json', () => ({ foo: 'bar' }))
  .get('/throw', (a) => a.b.c)

export default router

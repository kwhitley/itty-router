import { IRequestStrict } from 'IttyRouter'
import { Router } from 'Router'

const router = Router<IRequestStrict>()

type FooRequest = {
  foo: string
} & IRequestStrict

router
  .get('/basic', () => new Response('Success!'))
  .get('/text', () => 'Success!')
  // .get('/params/:foo', ({ foo }) => foo)              // should NOT work
  .get<FooRequest>('/params/:foo', ({ foo }) => foo)  // should work
  .get('/json', () => ({ foo: 'bar' }))

export default router

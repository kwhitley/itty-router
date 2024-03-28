import { IRequestStrict } from 'IttyRouter'
import { Router } from 'Router'

type FooRequest = {
  foo: string
} & IRequestStrict

const router = Router<FooRequest>()

router
  .get('/', (request) => {
    request.foo // should work
    // request.bar // should NOT work
  })

export default router

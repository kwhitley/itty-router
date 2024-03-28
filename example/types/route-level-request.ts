import { IRequestStrict } from 'IttyRouter'
import { Router } from 'Router'

type FooRequest = {
  foo: string
} & IRequestStrict

const router = Router()

router
  .get<FooRequest>('/', (request) => {
    request.foo // should work
    // request.bar // should NOT work
  })

export default router

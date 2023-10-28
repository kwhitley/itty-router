import { IRequest, Router } from 'Router'

type FooRequest = {
  foo: string
} & IRequest

const router = Router<FooRequest>()

// MIDDLEWARE: adds foo to the request
const withFoo = (request: IRequest) => {
  request.foo = 'bar' // no return = next handler gets fired (making this middleware)
}

// ADD ROUTES
router
  .all('*', withFoo) // we add Foo as global upstream middleware, but this could go anywhere

  .get('/foo-test', (request) => {
    return request.foo // 'bar'
  })

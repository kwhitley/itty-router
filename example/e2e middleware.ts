import { IRequest, IRequestStrict, Router } from 'Router'

type FooRequest = {
  foo: string
} & IRequest

type HasFoo = {
  foo?: string
} & IRequest

type HasBar = {
  bar?: string
} & IRequestStrict

const router = Router()

// MIDDLEWARE: adds foo to the request
const withFoo = (request: HasFoo & IRequest) => {
  request.foo = 'bar' // no return = next handler gets fired (making this middleware)
}

// MIDDLEWARE: adds foo to the request
const withBar = (request: HasBar & IRequest) => {
  request.bar = 'baz' // no return = next handler gets fired (making this middleware)
}

// ADD ROUTES
router
  .all('*', withFoo, withBar) // we add Foo as global upstream middleware, but this could go anywhere

  .get('/foo-test', (request) => {
    return request.foo // 'bar'
  })

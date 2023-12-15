import { IRequest, IRequestStrict, Router } from 'Router'

type HasFoo = {
  foo: string
} & IRequestStrict

type HasBar = {
  bar: string
} & IRequestStrict

const router = Router()

// MIDDLEWARE: adds foo to the request
const withFoo = (request: HasFoo) => {
  request.foo = 'bar' // no return = next handler gets fired (making this middleware)
}

// MIDDLEWARE: adds foo to the request
const withBar = (request: HasBar) => {
  request.bar = 'baz' // no return = next handler gets fired (making this middleware)
}

// ADD ROUTES
router
  .all<HasFoo & HasBar>('*', withFoo, withBar, (request) => {
    request.bar // this can be infered
    request.foo // this can be infered
  })

  .get('/', withFoo, withBar, (request) => {
    return request
  })

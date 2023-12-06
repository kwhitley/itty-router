import { IRequest, IRequestStrict, Router } from '../src/Router'

type HasFoo = {
  foo: string
} & IRequestStrict

type HasBar = {
  bar: string
} & IRequestStrict

const withFoo = (request: HasFoo) => {
  request.foo = 'bar'
  request.whoops
}

const withBar = (request: HasBar) => {
  request.bar = 'baz'
}

const custom = Router()

custom
  // type on the request itself
  .get('/', withFoo, withBar, (request: IRequestStrict & HasBar & HasFoo) => {
    request.foo
    request.bar
    request.whoops
  })

  // or at the route handler
  .post<IRequestStrict & HasFoo & HasBar>('/', withFoo, withBar, (request) => {
    request.foo
    request.bar
    request.whoops
  })

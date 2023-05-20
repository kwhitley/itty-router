import {
  Router,               // the router itself
  IRequest,             // lightweight/generic Request type
  RouterType,           // generic Router type
  Route,                // generic Route type
  createCors,
  json,
  error,
} from '../src'

type FooRequest = {
  foo: string
} & IRequest

type MyRouter = {
  puppy: Route
} & RouterType

const router = <MyRouter>Router({ base: '/' })

router
  // call custom HTTP method
  .puppy('/cat', () => {})


  .get('/foo/:id', ({ id }) => {

  })

  // custom request from handler
  .get('*', (request: FooRequest) => {
    const foo = request.foo
  })

  // custom request from Route
  .get<FooRequest>('*', (request) => {
    const foo = request.foo
  })

  // custom request and router from Route
  .get<FooRequest, MyRouter>('*', (request) => {
    const foo = request.foo
  })

  // call custom HTTP method again (to ensure preserved through chain)
  .puppy('/cat', () => {})

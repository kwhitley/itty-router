import {
  Router,               // the router itself
  IRequest,             // lightweight/generic Request type
  RouterType,           // generic Router type
  Route,                // generic Route type
} from '../src/Router'

type FooRequest = {
  foo: string
} & IRequest

type BarRequest = {
  bar: string
} & IRequest

type MyRouter = {
  puppy: Route
} & RouterType

type Env = {
  KV: string
}

type CF = [
  env: Env,
  ctx: ExecutionContext
]

const router = Router<FooRequest, MyRouter>({ base: '/' })

router
  // call custom HTTP method
  .puppy('/cat', () => {})

  // custom request from handler
  .get('*', (request) => {
    const foo = request.proxy
  })

  // custom request from handler
  .get('*', (request: FooRequest) => {
    const foo = request.foo
  })

  // custom request from handler
  .get('*', (request: BarRequest) => {
    const foo = request.foo
  })

  // custom request from Route
  .get<FooRequest, CF>('*', (request, env, ctx) => {
    ctx.waitUntil
    const foo = request.foo
  })

  // custom request and router from Route
  .get<FooRequest, [], MyRouter>('*', (request) => {
    const foo = request.foo
  })

  // call custom HTTP method again (to ensure preserved through chain)
  .puppy('/cat', () => {})

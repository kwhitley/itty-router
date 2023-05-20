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

const router = Router<FooRequest, CF, MyRouter>({ base: '/' })

router
  // call custom HTTP method
  .puppy('/cat', () => {})

  // standard request
  .get('*', (request, env: Env, ctx: ExecutionContext) => {
    request.url
    env.KV
    ctx.waitUntil
  })

  // custom request from handler argument
  .get('*', (request: FooRequest) => {
    request.foo
  })

  // custom request from handler argument
  .get('*', (request: BarRequest) => {
    request.bar
  })

  // custom request from Route
  .get<BarRequest, CF>('*', (request, env, ctx) => {
    env.KV
    ctx.waitUntil
    request.bar
  })

  // custom request and router from Route
  .get<FooRequest, CF, MyRouter>('*', (request) => {
    const foo = request.foo
  })

  // call custom HTTP method again (to ensure preserved through chain)
  .puppy('/cat', () => {})

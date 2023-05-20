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

type Env = {
  KV: string
}

type CF = [
  env: Env,
  ctx: ExecutionContext
]

// all of this is basically useless, but acting as a placeholder for hopefully an eventual fix
const router = Router<FooRequest, CF>({ base: '/' })

router
  // call custom HTTP method
  .puppy('/cat', (request) => {
    request.foo
  })

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

  // how to return another custom router method
  .get<FooRequest, CF, MyRouter>('*', (request) => {
    const foo = request.foo
  })

  // call custom HTTP method again (to ensure preserved through chain)
  .puppy('/cat', () => {})

  // undeclared HTTP method?
  .kitten<FooRequest>('/', (request) => {
    request.foo
  })

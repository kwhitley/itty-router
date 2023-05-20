import {
  Router,               // the router itself
  IRequest,             // lightweight/generic Request type
  IRequestStrict,       // stricter Request type
  RouterType,           // generic Router type
  Route,                // generic Route type
} from '../src/Router'

type FooRequest = {
  foo: string
} & IRequest

type BarRequest = {
  bar: number
} & IRequestStrict

// type MyRouter = {
//   puppy: Route
// } & RouterType

type Env = {
  KV: string
}

type CF = [
  env: Env,
  ctx: ExecutionContext
]

const router = Router({ base: '/' })

router
  // call custom HTTP method
  .puppy('/cat', (request) => {
    // supports standard Request by default
    request.arrayBuffer()
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

  // custom request from handler argument
  .get<BarRequest>('*', (request) => {
    request.bar
  })

  // custom request from Route
  .get<BarRequest, CF>('*', ({ bar }, env, ctx) => {
    env.KV
    ctx.waitUntil
  })

  // how to return another custom router method
  .get<FooRequest, CF>('*', (request) => {
    request.foo
  })

  // call custom HTTP method again (to ensure preserved through chain)
  .puppy('/cat', () => {})

  // undeclared HTTP method?
  .kitten<FooRequest>('/', (request) => {
    request.foo
  })

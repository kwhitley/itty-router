import {
  Router,               // the router itself
  IRequest,             // lightweight/generic Request type
  IRequestStrict,       // stricter Request type
  RouterType,           // generic Router type
  RouteHandler,         // generic Router type
  Route,                // generic Route type
  UniversalRoute,       // universal router
} from '../src/Router'

type FooRequest = {
  foo: string
} & IRequest

// extends IRequestStrict, meaning no undefined attributes off Request
type BarRequest = {
  bar: number
} & IRequestStrict

type Env = {
  KV: string
}

type CF = [
  env: Env,
  ctx: ExecutionContext
]

// this router defines a global signature of <BarRequest, CF>
const custom = Router<BarRequest, CF>()

custom
  .get('/',({ bar, json }) => {
    console.log('bar', bar)
  })

  // should not be able to access request.foo
  .get('/foo/:bar', (request, env, ctx) => {
    request.bar
    request.foo
    env.KV
    ctx.waitUntil
  })

  .handle()



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
  .get<BarRequest, CF>('*', ({ bar, foo }, env, ctx) => {
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

import {
  IRequest,
  IRequestStrict,
  Router,
  createCors,
} from '../src'

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

const { preflight, corsify } = createCors()

custom
  .all('*', preflight)

  // should not be able to access request.foo
  .get('/foo/:bar', (request, env, ctx) => {
    request.bar
    request.foo
    env.KV
    ctx.waitUntil
  })

const router = Router({ base: '/' })

router
  .all('*', preflight)

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

  .handle<CF>({ method: 'GET', url: 'foo.bar' }, {}, 'asd')

type CFfetch = [
  request: Request,
  env: Env,
  ctx: ExecutionContext
]

export default {
  fetch: (...args: CFfetch) => router.handle(...args)
}

// WITH FLOW (overriding options, and enabling CORS)
import { Router, error, flow } from '../src'
import { IRequest, IRequestStrict } from '../src'

type Env = {
  KV: object
}

type CustomRequest = {
  foo: string
} & IRequestStrict

type RouterArgs = [env: Env]
type RouterArgs2 = [env: Env, ctx: ExecutionContext]

const universalRouter =
  Router<CustomRequest, RouterArgs>()
    .get('/type-check', (request, env) => {
      request.foo // should be found
      env.KV // should be found
      env.KB // should NOT be found
    })
    .get<IRequestStrict>('/type-check', (request, env) => {
      request.foo // should NOT be found
      env.KV // should be found
      env.KB // should NOT be found
    })
    .puppy('/type-check', (request, env) => {
      request.foo // should be found
      env.KV // should be found
      env.KB // should NOT be found
    })
    .puppy<CustomRequest, RouterArgs2>('/type-check', (request, env) => {
      request.foo // should be found
      env.KV // should be found
      env.KB // should NOT be found
    })

// Router without generics will use IRequest by default
const overrideRouter =
  Router()
    .get('/type-check', (request, env, ctx) => {
      request.whatever // should ignore
      env.whatever // should ignore
      ctx.whatever // should ignore
    })
    .get<IRequestStrict, RouterArgs2>('/type-check', (request, env, ctx) => {
      request.foo // should NOT be found
      ctx.waitUntil // should infer
    })

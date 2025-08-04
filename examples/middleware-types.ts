import { Router, IRequest, IRequestStrict } from '../src'
import { withContent } from '../src'
import { type HasContent } from '../src'
import { RequestHandler } from '../src'

type Foo = {
  foo: string
}

type Bar = {
  bar: string
}

const withFooHandler: RequestHandler<IRequestStrict & Foo> = (request) => {
  request.foo = 'bar'
}

const withBarHandler: RequestHandler<IRequestStrict & Bar & Foo> = (request) => {
  request.bar = 'bar'
}

const withFoo = (request: IRequestStrict & Foo) => {
  request.foo = 'bar'
}

const withBar = (request: IRequest & Bar) => {
  request.bar = 'baz'
}

const router = Router<IRequestStrict>({
  before: []
})

router.get('/test', withContent<number>, (request) => {
  request.foo
  request.bar
  request.content++
  request.test = 'far'
})

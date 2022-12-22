import {
  Router,               // the router itself
  IRequest,             // lightweight/generic Request type
  Route,
} from './itty-router'

// declare a custom methods type to allow custom methods
interface CustomMethods {
  puppy: Route,
}

// declare a custom Request type to allow request injection from middleware
type RequestWithAuthors = {
  authors?: string[]
} & IRequest

// middleware that modifies the request
const withAuthors = (request: IRequest) => {
  request.authors = ['foo', 'bar']
}

const router = Router<{}, CustomMethods>({ base: '/' })

router
  .all('*', () => { })
  .get('/authors', withAuthors, (request: RequestWithAuthors) => {
    return request.authors?.[0]
  })
  .puppy('/:name', (request) => {
    const name = request.params.name
    const foo = request.query.foo
  })

// CF ES6 module syntax
export default {
  fetch: (request, env, context) => router.handle(request, env, context)
}

// test traditional eventListener Worker syntax
addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(router.handle(event.request))
})

// Add custom properties to the Request type at the Router level
type customRequestProps = {
  foo: string
}

const router2 = Router<customRequestProps>()
  // middleware to poppulate request.foo
  .get('/foo', (request) => { request.foo = 'bar' })
  // route handler that uses request.foo
  .get('/foo', (request) => {
    return new Response(request.foo)
  })
  // Still able to use custom route-specific request properties
  .get('/authors', withAuthors, (request: RequestWithAuthors) => {
    return request.authors?.[0]
  })

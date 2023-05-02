import {
  Router,               // the router itself
  IRequest,             // lightweight/generic Request type
  RouterType,           // generic Router type
  Route,                // generic Route type
  createCors,
  json,
  error,
} from '../src'

// declare a custom Request type to allow request injection from middleware
type RequestWithAuthors = {
  authors?: string[]
} & IRequest

// middleware that modifies the request
const withAuthors = (request: IRequest) => {
  request.authors = ['foo', 'bar']
}

const { corsify, preflight } = createCors()

const router = Router<'/', 'puppy'>({ base: '/' })

router
  .all('*', preflight)
  .get('/authors', withAuthors, (request: RequestWithAuthors) => {
    return request.authors?.[0]
  })
  .puppy('/:name', (request) => {
    const name = request.params.name
    const foo = request.query.foo
  })
  .all('*', () => error(404))

// CF ES6 module syntax
export default {
  fetch: (request: IRequest, env: object, context: object) =>
            router
              .handle(request, env, context)
              .then(json)
              .catch(error)
              .then(corsify)
}

// test traditional eventListener Worker syntax
addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(router.handle(event.request))
})

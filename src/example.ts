import {
  Router,               // the router itself
  IRequest,             // lightweight/generic Request type
  RouterType,           // generic Router type
  Route,                // generic Route type
} from './itty-router'

// declare a custom Router type with used methods
interface CustomRouter extends RouterType {
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

const router = Router({ base: '/' })

router
  .all('*', () => {})
  .get<CustomRouter>('/authors', withAuthors, (request: RequestWithAuthors) => {
    return request.authors?.[0]
  })
  .puppy('*', (request) => {
    const foo = request.query.foo
  })

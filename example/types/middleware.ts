import { IRequestStrict, IRequest, IttyRouter, RequestHandler } from 'IttyRouter'

type UserRequest = {
  user: string
} & IRequestStrict

const router = IttyRouter()

const withUser: RequestHandler<UserRequest> = (request) => {
  request.user = 'Kevin'
}

router
  // upstream request sees the request as IRequest (default), so anything goes
  .get('/', (request) => {
    request.user = 123 // allowed because IRequest
  })

  // then we add the middleware defined above as <UserRequest>
  .all('*', withUser)

  // and now downstream requests expect a UserRequest
  .get('/', (request) => {
    request.user = 123  // NOT VALID
  })

  // and if we ever need to restore control, add the generic back in
  .get<IRequest>('/', (request) => {
    request.user = 123 // now this is ok
  })

  .get('/', (request) => {
    request.user = 123 // and so is this
  })

export default router

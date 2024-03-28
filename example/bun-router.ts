import { IRequest, IRequestStrict } from 'IttyRouter'
import { Router } from '../src/Router'
import { error } from '../src/error'
import { json } from '../src/json'
import { withParams } from '../src/withParams'

const logger = (response: Response, request: IRequest) => {
  console.log(response.status, request.url, '@', new Date().toLocaleString())
}

const router = Router<IRequestStrict>({
  port: 3001,
  before: [withParams],
  finally: [json, logger],
  catch: error,
})

router
  .get('/basic', () => new Response('Success!'))
  .get('/text', () => 'Success!')
  .get<IRequest>('/params/:foo', ({ foo }) => foo)
  .get('/json', () => ({ foo: 'bar' }))
  .get('/throw', a => a.b.c)
  .all('*', () => error(404))

export default router

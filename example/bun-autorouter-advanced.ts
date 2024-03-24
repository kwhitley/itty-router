import { text } from 'text'
import { json } from 'json'
import { AutoRouter } from '../src/AutoRouter'
import { error } from 'error'
import { IRequest } from 'IttyRouter'
import { withParams } from 'withParams'

const router = AutoRouter({
  port: 3001,
  missing: () => error(404, 'Are you sure about that?'),
  format: () => {},
  before: [
    (r: any) => { r.date = new Date },
  ],
  finally: [
    (r: Response, request: IRequest) =>
      console.log(r.status, request.method, request.url, 'delivered in', Date.now() - request.date, 'ms from', request.date.toLocaleString()),
  ]
})

const childRouter = AutoRouter({
  base: '/child',
  missing: () => {},
})
  .get('/:id', ({ id }) => [ Number(id), Number(id) / 2 ])

router
  .get('/basic', () => new Response('Success!'))
  .get('/text', () => 'Success!')
  .get('/params/:foo', ({ foo }) => foo)
  .get('/json', () => ({ foo: 'bar' }))
  .get('/throw', (a) => a.b.c)
  .get('/child/*', childRouter.fetch)

export default router

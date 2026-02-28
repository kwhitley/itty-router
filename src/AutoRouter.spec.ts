import { describe, expect, it, mock } from 'bun:test'
import { toReq } from '../lib'
import { AutoRouter } from './AutoRouter'
import { cors } from './cors'
import { text } from './text'
import { error } from './error'

describe(`SPECIFIC TESTS: AutoRouter`, () => {
  const jsonData = [1,2,3]

  describe('BEHAVIORS', () => {
    describe('DEFAULT', () => {
      it('returns a generic 404 on route miss', async () => {
        const router = AutoRouter()

        const response = await router.fetch(toReq('/'))
        expect(response.status).toBe(404)
      })

      it('formats unformated responses as JSON', async () => {
        const router = AutoRouter().get('/', () => jsonData)

        const response = await router.fetch(toReq('/'))
        const parsed = await response.json()
        expect(parsed).toEqual(jsonData)
      })

      it('includes withParams', async () => {
        const handler = mock(({ id }) => id)
        const router = AutoRouter().get('/:id', handler)

        await router.fetch(toReq('/foo'))
        expect(handler.mock.results[0].value).toEqual('foo')
      })

      it('catches errors by default', async () => {
        const router = AutoRouter().get('/', a => a.b.c)

        const response = await router.fetch(toReq('/'))
        expect(response.status).toBe(500)
      })
    })

    describe('OPTIONS', () => {
      it('format: FormatterFunction - replaces default JSON formatting', async () => {
        const router = AutoRouter({ format: text }).get('/', () => 'foo')

        const response = await router.fetch(toReq('/'))
        expect(response.headers.get('content-type').includes('text')).toBe(true)
      })

      it('missing: RouteHandler - replaces default missing error', async () => {
        const router = AutoRouter({ missing: () => error(418) })

        const response = await router.fetch(toReq('/'))
        expect(response.status).toBe(418)
      })

      it('missing: RouteHandler - receives request as the first parameter', async () => {
        const missing = mock(() => {})
        const router = AutoRouter({ missing })
        const request = toReq('/')
        await router.fetch(request)
        expect(missing).toBeCalledWith(request)
      })
      
      it('before: RouteHandler - adds upstream middleware', async () => {
        const handler = mock(r => typeof r.date)
        const router = AutoRouter({
          before: [
            r => { r.date = Date.now() }
          ]
        }).get('*', handler)

        await router.fetch(toReq('/'))
        expect(handler.mock.results[0].value).toEqual('number')
      })

      describe('cors: CorsPair - adds CORS support via cors() output', () => {
        it('adds CORS headers to responses', async () => {
          const router = AutoRouter({ cors: cors() }).get('/', () => 'hello')

          const response = await router.fetch(toReq('/', { headers: { origin: 'https://foo.bar' } }))
          expect(response.headers.get('access-control-allow-origin')).toBe('*')
        })

        it('handles preflight OPTIONS requests', async () => {
          const router = AutoRouter({ cors: cors() }).get('/', () => 'hello')

          const response = await router.fetch(toReq('OPTIONS /', { headers: { origin: 'https://foo.bar' } }))
          expect(response.status).toBe(204)
          expect(response.headers.get('access-control-allow-origin')).toBe('*')
        })

        it('passes cors options through', async () => {
          const origin = 'https://foo.bar'
          const router = AutoRouter({ cors: cors({ origin }) }).get('/', () => 'hello')

          const response = await router.fetch(toReq('/', { headers: { origin } }))
          expect(response.headers.get('access-control-allow-origin')).toBe(origin)
        })

        it('works alongside other before/finally handlers', async () => {
          const handler = mock(r => typeof r.date)
          const router = AutoRouter({
            cors: cors(),
            before: [r => { r.date = Date.now() }],
          }).get('*', handler)

          const response = await router.fetch(toReq('/', { headers: { origin: 'https://foo.bar' } }))
          expect(handler.mock.results[0].value).toEqual('number')
          expect(response.headers.get('access-control-allow-origin')).toBe('*')
        })

        it('behaves identically to manual before/finally wiring', async () => {
          const origin = 'https://foo.bar'
          const opts = { origin, credentials: true as const }
          const req = toReq('/', { headers: { origin } })

          // Manual wiring
          const { preflight, corsify } = cors(opts)
          const manual = AutoRouter({
            before: [preflight],
            finally: [corsify],
          }).get('/', () => 'hello')

          // cors option
          const auto = AutoRouter({ cors: cors(opts) }).get('/', () => 'hello')

          const manualRes = await manual.fetch(req)
          const autoRes = await auto.fetch(toReq('/', { headers: { origin } }))

          expect(autoRes.headers.get('access-control-allow-origin'))
            .toBe(manualRes.headers.get('access-control-allow-origin'))
          expect(autoRes.headers.get('access-control-allow-credentials'))
            .toBe(manualRes.headers.get('access-control-allow-credentials'))
        })
      })

      describe('finally: (response: Response, request: IRequest, ...args) - ResponseHandler', async () => {
        it('modifies the response if returning non-null value', async () => {
          const router = AutoRouter({
            finally: [ () => true ]
          }).get('*', () => 314)

          const response = await router.fetch(toReq('/'))
          expect(response).toBe(true)
        })

        it('does not modify the response if returning null values', async () => {
          const router = AutoRouter({
            finally: [
              () => {},
              () => undefined,
              () => null,
            ]
          }).get('*', () => 314)

          const response = await router.fetch(toReq('/'))
          const parsed = await response.json()
          expect(response.status).toBe(200)
          expect(parsed).toBe(314)
        })
      })
    })
  })
})


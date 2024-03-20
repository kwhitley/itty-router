import { describe, expect, it, vi } from 'vitest'
import { toReq } from '../test'
import { AutoRouter } from './AutoRouter'
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
        const handler = vi.fn(({ id }) => id)
        const router = AutoRouter().get('/:id', handler)

        await router.fetch(toReq('/foo'))
        expect(handler).toHaveReturnedWith('foo')
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

      it('before: RouteHandler - adds upstream middleware', async () => {
        const handler = vi.fn(r => typeof r.date)
        const router = AutoRouter({
          before: [
            r => { r.date = Date.now() }
          ]
        }).get('*', handler)

        await router.fetch(toReq('/'))
        expect(handler).toHaveReturnedWith('number')
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


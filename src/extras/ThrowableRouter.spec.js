import 'isomorphic-fetch'

import { ThrowableRouter } from './ThrowableRouter'

describe('router/ThrowableRouter', () => {
  describe('ThrowableRouter(options = {})', () => {
    it('is an itty proxy', () => {
      const origin = {}
      const router = ThrowableRouter(origin)

      router.get('/foo', () => {})

      expect(typeof origin.r).toBe('object')
      expect(origin.r.length).toBe(1)
    })

    it('captures a throw', async () => {
      const router = ThrowableRouter()

      router.get('/breaks', request => request.will.throw)

      const response = await router.handle(new Request('https://slick/breaks'))

      expect(response.status).toBe(500)

      const payload = await response.json()

      expect(payload.error).not.toBeUndefined()
      expect(payload.status).toBe(500)
    })

    it('includes a stack trace with option', async () => {
      const router = ThrowableRouter({ stack: true })

      router.get('/breaks', request => request.will.throw)

      const response = await router.handle(new Request('https://slick/breaks'))
      const payload = await response.json()

      expect(response.status).toBe(500)
      expect(payload.error).not.toBeUndefined()
      expect(payload.stack).not.toBeUndefined()
      expect(payload.status).toBe(500)
    })
  })
})

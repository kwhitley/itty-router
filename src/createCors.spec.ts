import 'isomorphic-fetch'
import { describe, expect, it, vi } from 'vitest'
import { createCors } from './createCors'
import { json } from './json'
import { Router } from './Router'

describe('createCors(options)', () => {
  it('returns { preflight, corsify }', async () => {
    const { preflight, corsify } = createCors()

    expect(typeof preflight).toBe('function')
    expect(typeof corsify).toBe('function')
  })

  describe('options', () => {
    it('maxAge', async () => {
      const { preflight } = createCors({
        maxAge: 60,
      })
      const router = Router().all('*', preflight)
      const request = new Request('https://foo.bar', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type',
          origin: 'http://localhost:3000',
        },
      })
      const response = await router.handle(request)

      expect(response.headers.get('Access-Control-Max-Age')).toBe('60')
    })

    it('origins should be array of string', async () => {
      const { preflight, corsify } = createCors({
        origins: ['http://localhost:3000', 'http://localhost:4000']
      })
      const router = Router().all('*', preflight)

      const generateRequest = (origin: string) => new Request('https://foo.bar', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type',
          origin,
        }
      })

      const response1 = await router.handle(generateRequest('http://localhost:3000'))
      expect(response1.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')
      const response2 = await router.handle(generateRequest('http://localhost:4000'))
      expect(response2.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:4000')

      const response3 = await router.handle(generateRequest('http://localhost:5000'))
      expect(response3.headers.get('Access-Control-Allow-Origin')).toBe(null)
    })

    it('origins should be function returns boolean', async () => {
      const { preflight, corsify } = createCors({
        origins: (origin) => origin.startsWith("https://") && origin.endsWith('.example.com')
      })
      const router = Router().all('*', preflight)

      const generateRequest = (origin: string) => new Request('https://foo.bar', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type',
          origin,
        }
      })

      const response1 = await router.handle(generateRequest('https://secure.example.com'))
      expect(response1.headers.get('Access-Control-Allow-Origin')).toBe('https://secure.example.com')
      const response2 = await router.handle(generateRequest('https://another-secure.example.com'))
      expect(response2.headers.get('Access-Control-Allow-Origin')).toBe('https://another-secure.example.com')

      const response3 = await router.handle(generateRequest('http://unsecure.example.com'))
      expect(response3.headers.get('Access-Control-Allow-Origin')).toBe(null)
    })
  })

  describe('preflight (middleware)', () => {
    it('should handle options requests', async () => {
      const { preflight } = createCors()
      const router = Router().all('*', preflight)
      const request = new Request('https://foo.bar', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type',
          origin: 'http://localhost:3000',
        },
      })
      const response = await router.handle(request)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'http://localhost:3000'
      )
    })

    it('should handle OPTIONS requests without standard headers via Allow (methods) header', async () => {
      const { preflight } = createCors()
      const router = Router().all('*', preflight)
      const request = new Request('https://foo.bar', { method: 'OPTIONS' })
      const response = await router.handle(request)

      expect((response.headers.get('Allow') || '').includes('GET')).toBe(true)
    })
  })

  describe('corsify(response: Response): Response', () => {
    it('should throw if no Response passed as argument', async () => {
      const { preflight, corsify } = createCors()
      const catchError = vi.fn()
      const router = Router()
        .all('*', preflight)
        .get('/foo', () => json(13))
      const request = new Request('https://foo.bar/miss')
      await router.handle(request).then(corsify).catch(catchError)

      expect(catchError).toHaveBeenCalled()
    })

    it('should handle options requests', async () => {
      const { preflight, corsify } = createCors()
      const router = Router()
        .all('*', preflight)
        .get('/foo', () => json(13))
      const request = new Request('https://foo.bar/foo', {
        headers: {
          origin: 'http://localhost:3000',
        },
      })
      const response = await router.handle(request).then(corsify)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'http://localhost:3000'
      )
      expect(
        (response.headers.get('Access-Control-Allow-Methods') || '').includes(
          'GET'
        )
      ).toBe(true)
    })

    it('will not modify responses with existing CORS headers', async () => {
      const { preflight, corsify } = createCors()
      const router = Router()
        .all('*', preflight)
        .get(
          '/foo',
          () =>
            new Response(null, {
              headers: {
                'access-control-allow-origin': '*',
              },
            })
        )
      const request = new Request('https://foo.bar/foo', {
        headers: {
          origin: 'http://localhost:3000',
        },
      })
      const response = await router.handle(request).then(corsify)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('will not modify redirects or 101 status responses', async () => {
      const { preflight, corsify } = createCors()
      const router = Router()
        .all('*', preflight)
        .get('/foo', () => new Response(null, { status: 101 }))
      const request = new Request('https://foo.bar/foo', {
        headers: {
          origin: 'http://localhost:3000',
        },
      })
      const response = await router.handle(request).then(corsify)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(null)
    })

    describe('repeated use', () => {
      const { preflight } = createCors()
      const router = Router().all('*', preflight)
      const origin = 'http://localhost:3000'

      const generateRequest = () =>
        new Request('https://foo.bar', {
          method: 'OPTIONS',
          headers: {
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'content-type',
            origin,
          },
        })

      it('will work multiple times in a row', async () => {
        const response1 = await router.handle(generateRequest())
        expect(response1.status).toBe(200)
        expect(response1.headers.get('Access-Control-Allow-Origin')).toBe(
          origin
        )

        const response2 = await router.handle(generateRequest())
        expect(response2.status).toBe(200)
        expect(response2.headers.get('Access-Control-Allow-Origin')).toBe(
          origin
        )
      })
    })
  })

  // it('returns { preflight, corsify }', async () => {
  //   const router = Router()
  //   const handler = vi.fn(({ content }) => content)
  //   const request = new Request('https://foo.bar', {
  //     method: 'POST',
  //     headers: {
  //       'content-type': 'application/json'
  //     },
  //     body: JSON.stringify({ foo: 'bar' })
  //   })

  //   await router
  //           .post('/', withContent, handler)
  //           .handle(request)

  //   expect(handler).toHaveReturnedWith({ foo: 'bar' })
  // })
})

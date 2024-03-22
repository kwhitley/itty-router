import { describe, expect, it, vi } from 'vitest'
import { createCors } from './createCors'
import { json } from './json'
import { Router } from './Router'
import { toReq } from '../test'

class WebSocketResponse {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 101
    this.statusText = options.statusText || 'Switching Protocols'
    this.headers = options.headers || new Headers()
  }
}

const corsReq = (origin: string = 'http://localhost:3000', options: RequestInit = { method: 'OPTIONS' }) => toReq('https://foo.bar', {
  ...options,
  headers: {
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'content-type',
    origin,
  }
})

const GENERIC_OPTIONS_REQUEST = corsReq()
const GENERIC_GET_REQUEST = toReq('http://localhost:3000')

describe('createCors(options)', () => {
  it('returns { preflight, corsify }', async () => {
    const { preflight, corsify } = createCors()

    expect(typeof preflight).toBe('function')
    expect(typeof corsify).toBe('function')
  })

  describe('OPTIONS', () => {
    describe('maxAge: number', () => {
      it('sets the Access-Control-Max-Age header', async () => {
        const { preflight } = createCors({
          maxAge: 60,
        })
        const router = Router().all('*', preflight)
        const response = await router.fetch(GENERIC_OPTIONS_REQUEST)

        expect(response.headers.get('Access-Control-Max-Age')).toBe('60')
      })
    })

    it('origins should be array of string', async () => {
      const { preflight } = createCors({
        origins: ['http://localhost:3000', 'http://localhost:4000']
      })
      const router = Router().all('*', preflight)

      const response1 = await router.fetch(GENERIC_OPTIONS_REQUEST)
      expect(response1.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')

      const response2 = await router.fetch(corsReq('http://localhost:4000'))
      expect(response2.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:4000')

      const response3 = await router.fetch(corsReq('http://localhost:5000'))
      expect(response3.headers.get('Access-Control-Allow-Origin')).toBe(null)
      expect(response3.status).toBe(401)
    })

    it('origins should be function returns boolean', async () => {
      const { preflight } = createCors({
        origins: (origin) => origin.startsWith('https://') && origin.endsWith('.example.com')
      })
      const router = Router().all('*', preflight)

      const response1 = await router.fetch(corsReq('https://secure.example.com'))
      expect(response1.headers.get('Access-Control-Allow-Origin')).toBe('https://secure.example.com')
      const response2 = await router.fetch(corsReq('https://another-secure.example.com'))
      expect(response2.headers.get('Access-Control-Allow-Origin')).toBe('https://another-secure.example.com')
      const response3 = await router.fetch(corsReq('http://unsecure.example.com'))
      expect(response3.headers.get('Access-Control-Allow-Origin')).toBe(null)
    })
  })

  describe('preflight (middleware)', () => {
    it('should handle options requests', async () => {
      const { preflight } = createCors()
      const router = Router().all('*', preflight)
      const response = await router.fetch(GENERIC_OPTIONS_REQUEST)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should handle options requests', async () => {
      const { preflight } = createCors()
      const router = Router().all('*', preflight)
      const response = await router.fetch(GENERIC_OPTIONS_REQUEST)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should handle OPTIONS requests without standard headers via Allow (methods) header', async () => {
      const { preflight } = createCors()
      const router = Router().all('*', preflight)
      const request = new Request('https://foo.bar', { method: 'OPTIONS' })
      const response = await router.fetch(request)

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
      await router.fetch(request).then(corsify).catch(catchError)

      expect(catchError).toHaveBeenCalled()
    })

    it('should handle options requests', async () => {
      const { preflight, corsify } = createCors()
      const router = Router()
        .all('*', preflight)
        .get('/', () => json(13))
      const response = await router.fetch(GENERIC_OPTIONS_REQUEST).then(corsify)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
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
          '/',
          () =>
            new Response(null, {
              headers: {
                'access-control-allow-origin': '*',
              },
            })
        )
      const response = await router.fetch(GENERIC_GET_REQUEST).then(corsify)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('will not modify redirects or 101 status responses', async () => {
      const { preflight, corsify } = createCors()
      const router = Router()
        .all('*', preflight)
        .get('/', () => new WebSocketResponse(null, { status: 101 }))
      const response = await router.fetch(GENERIC_GET_REQUEST).then(corsify)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(null)
    })

    describe('repeated use', () => {
      const { preflight } = createCors()
      const router = Router().all('*', preflight)
      const origin = 'http://localhost:3000'

      it('will work multiple times in a row', async () => {
        const response1 = await router.fetch(GENERIC_OPTIONS_REQUEST)
        expect(response1.status).toBe(200)
        expect(response1.headers.get('Access-Control-Allow-Origin')).toBe('*')

        const response2 = await router.fetch(GENERIC_OPTIONS_REQUEST)
        expect(response2.status).toBe(200)
        expect(response2.headers.get('Access-Control-Allow-Origin')).toBe('*')
      })
    })
  })
})

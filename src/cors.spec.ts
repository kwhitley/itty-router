import { describe, expect, it } from 'vitest'
import { toReq } from '../lib'
import { Router } from './Router'
import { CorsOptions, cors } from './cors'
import { text } from './text'

// outputs a router with a single route at index
const corsRouter = (options?: CorsOptions) => {
  const { preflight, corsify } = cors(options)

  return Router({
    before: [preflight],
    finally: [text, corsify],
  }).get('/', () => TEST_STRING)
}

const DEFAULT_ROUTER = corsRouter()
const HEADERS_AS_ARRAY = [ 'x-foo', 'x-bar' ]
const HEADERS_AS_STRING = HEADERS_AS_ARRAY.join(',')
const TEST_STRING = 'Hello World'
const TEST_ORIGIN = 'https://foo.bar'
const REGEXP_DENY_ORIGIN = /^https:\/\/google.com$/
const BASIC_OPTIONS_REQUEST = toReq('OPTIONS /', {
  headers: { origin: TEST_ORIGIN },
})
const BASIC_REQUEST = toReq('/', {
  headers: { origin: TEST_ORIGIN },
})

describe('cors(options?: CorsOptions)', () => {
  describe('BEHAVIOR', () => {
    it('returns a { preflight, corsify } handler set', () => {
      const { preflight, corsify } = cors()

      expect(typeof preflight).toBe('function')
      expect(typeof corsify).toBe('function')
    })
  })

  describe('OPTIONS', () => {
    describe('origin', () => {
      it('defaults to *', async () => {
        const response = await DEFAULT_ROUTER.fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe('*')
      })

      it('can accept a string', async () => {
        const response = await corsRouter({ origin: TEST_ORIGIN }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
      })

      it('can accept a RegExp object (if test passes, reflect origin)', async () => {
        const response = await corsRouter({ origin: /oo.bar$/ }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
      })

      it('can accept a RegExp object (undefined if fails)', async () => {
        const response = await corsRouter({ origin: REGEXP_DENY_ORIGIN }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBeNull()
      })

      it('can accept true (reflect origin)', async () => {
        const response = await corsRouter({ origin: true }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
      })

      it('can accept a function (reflect origin if passes)', async () => {
        const response = await corsRouter({ origin: () => TEST_ORIGIN.toUpperCase() }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN.toUpperCase())
      })

      it('can accept a function (undefined if fails)', async () => {
        const response = await corsRouter({ origin: () => undefined }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBeNull()
      })

      it('can accept an array of strings (reflect origin if passes)', async () => {
        const response = await corsRouter({ origin: [TEST_ORIGIN] }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
      })

      it('can accept an array of strings (undefined if fails)', async () => {
        const response = await corsRouter({ origin: [] }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBeNull()
      })
    })

    describe('allowMethods', () => {
      it('defaults to *', async () => {
        const response = await DEFAULT_ROUTER.fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-methods')).toBe('*')
      })

      it('can accept a string', async () => {
        const response = await corsRouter({ allowMethods: 'GET,POST' }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-methods')).toBe('GET,POST')
      })

      it('can accept a an array of strings', async () => {
        const response = await corsRouter({ allowMethods: ['GET', 'POST'] }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-methods')).toBe('GET,POST')
      })
    })

    describe('allowHeaders', () => {
      it('defaults to undefined/null', async () => {
        const response = await DEFAULT_ROUTER.fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-headers')).toBeNull()
      })

      it('can accept a string', async () => {
        const response = await corsRouter({ allowHeaders: HEADERS_AS_STRING }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-headers')).toBe(HEADERS_AS_STRING)
      })

      it('can accept a an array of strings', async () => {
        const response = await corsRouter({ allowHeaders: HEADERS_AS_ARRAY }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-headers')).toBe(HEADERS_AS_STRING)
      })
    })

    describe('exposeHeaders', () => {
      it('defaults to undefined/null', async () => {
        const response = await DEFAULT_ROUTER.fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-expose-headers')).toBeNull()
      })

      it('can accept a string', async () => {
        const response = await corsRouter({ exposeHeaders: HEADERS_AS_STRING }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-expose-headers')).toBe(HEADERS_AS_STRING)
      })

      it('can accept a an array of strings', async () => {
        const response = await corsRouter({ exposeHeaders: HEADERS_AS_ARRAY }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-expose-headers')).toBe(HEADERS_AS_STRING)
      })
    })

    describe('credentials', () => {
      it('defaults to undefined/null', async () => {
        const response = await DEFAULT_ROUTER.fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-credentials')).toBeNull()
      })

      it('can accept true', async () => {
        const response = await corsRouter({ credentials: true }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-credentials')).toBe('true')
      })

      it('reflect domain if origin is *', async () => {
        const response = await corsRouter({ credentials: true }).fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
      })
    })
  })

  describe('preflight', () => {
    describe('BEHAVIOR', () => {
      it('responds to OPTIONS requests', async () => {
        const response = await DEFAULT_ROUTER.fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe('*')
      })

      it('ignores non-OPTIONS requests (does not return)', async () => {
        const response = await DEFAULT_ROUTER.fetch(BASIC_REQUEST)
        expect(response.status).toBe(200)
      })

      it('responds with status 204', async () => {
        const response = await DEFAULT_ROUTER.fetch(BASIC_OPTIONS_REQUEST)
        expect(response.status).toBe(204)
      })
    })
  })

  describe('corsify', () => {
    describe('BEHAVIOR', () => {
      it('adds cors headers to Response', async () => {
        const { corsify } = cors()
        const response = corsify(new Response(null))
        const response2 = corsify(new Response(null), BASIC_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe('*')
        expect(response.headers.get('access-control-allow-methods')).toBe('*')
        expect(response2.headers.get('access-control-allow-origin')).toBe('*')
      })

      it('will reflect origin (from request) if origin: true', async () => {
        const { corsify } = cors({ origin: true })
        const response = corsify(new Response(null))
        const response2 = corsify(new Response(null), BASIC_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBeNull()
        expect(response2.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
      })

      it('will reflect origin (from request) if origin is in array of origins', async () => {
        const { corsify } = cors({ origin: [TEST_ORIGIN] })
        const response = corsify(new Response(null))
        const response2 = corsify(new Response(null), BASIC_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBeNull()
        expect(response2.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
      })

      it('will reflect origin (from request) if origin passes RegExp origin test', async () => {
        const { corsify } = cors({ origin: /oo.bar$/ })
        const response = corsify(new Response(null))
        const response2 = corsify(new Response(null), BASIC_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBeNull()
        expect(response2.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
      })

      it('will pass origin as string if given', async () => {
        const { corsify } = cors({ origin: TEST_ORIGIN })
        const response = corsify(new Response(null))
        const response2 = corsify(new Response(null), BASIC_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
        expect(response2.headers.get('access-control-allow-origin')).toBe(TEST_ORIGIN)
      })

      it('will safely preserve multiple cookies (or other identical header names)', async () => {
        const { corsify } = cors()
        const response = new Response(null)
        response.headers.append('Set-Cookie', 'cookie1=value1; Path=/; HttpOnly')
        response.headers.append('Set-Cookie', 'cookie2=value2; Path=/; Secure')
        const corsified = corsify(response.clone())

        expect(response.headers.getSetCookie().length).toBe(2)
        expect(corsified.headers.getSetCookie().length).toBe(2)
      })
    })
  })
})

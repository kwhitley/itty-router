import { Router } from './Router'
import { CorsOptions, cors } from './cors'
import { toReq } from '../lib'
import { text } from './text'
import { describe, vi, expect, it } from 'vitest'


// outputs a router with a single route at index
const corsRouter = (options?: CorsOptions) => {
  const { preflight, corsify } = cors(options)

  return Router({
    before: [preflight],
    finally: [text, corsify],
  }).get('/', () => TEST_STRING)
}

const TEST_STRING = 'Hello World'
const TEST_ORIGIN = 'https://foo.bar'

const BASIC_OPTIONS_REQUEST = toReq('OPTIONS /')

const DEFAULT_ROUTER = corsRouter()

const HEADERS_AS_ARRAY = [ 'x-foo', 'x-bar' ]
const HEADERS_AS_STRING = HEADERS_AS_ARRAY.join(',')

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
    })
  })

  // describe('OPTIONS', () => {
  //   describe('DEFAULTS')
  //   it('returns a { preflight, corsify } handler set', () => {
  //     const { preflight, corsify } = cors()

  //     expect(typeof preflight).toBe('function')
  //     expect(typeof corsify).toBe('function')
  //   })
  // })

  describe('preflight', () => {
    describe('BEHAVIOR', () => {
      it('intercepts OPTIONS requests', async () => {
        const response = await DEFAULT_ROUTER.fetch(BASIC_OPTIONS_REQUEST)
        expect(response.headers.get('access-control-allow-origin')).toBe('*')
      })
    })
  })
})

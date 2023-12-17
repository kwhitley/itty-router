import 'isomorphic-fetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import { error } from './error'
import { AutoRouter } from './AutoRouter'

const request = (path: string, method = 'GET') =>
  ({ method, url: `https://itty.dev${path}` })

let router
let createRouter

beforeEach(() => {
  createRouter = (router) => router
                              .get('/', () => 'index')
                              .get('/items', () => [1,2,3])
                              .get('/throw', (r) => r.a.b.c)
                              .get('/params/:foo', ({ foo }) => ({ foo }))

  router = createRouter(AutoRouter())
})

describe('flow(router: RouterType, options: FlowOptions): RequestHandler', () => {
  it('should return a router', async () => {
    expect(typeof router.handle).toBe('function')
    expect(typeof router.fetch).toBe('function')
  })

  describe('DEFAULT BEHAVIOR', () => {
    it('includes a default 404 handler', async () => {
      let response = await router.handle(request('/missing')).then(r => r.json())
      expect(response.status).toBe(404)
    })

    it('formats as json', async () => {
      let response = await router.handle(request('/items')).then(r => r.json())
      expect(response).toEqual([1,2,3])
    })

    it('catches errors', async () => {
      let response = await router.handle(request('/throw'))
      expect(response.status).toBe(500)
    })

    it('does not include CORS', async () => {
      let response = await router.handle(request('/items'))
      expect(response.headers.get('access-control-allow-methods')).toBe(null)
    })

    it('includes withParams by default', async () => {
      let response = await router.handle(request('/params/bar')).then(r => r.json())
      expect(response.foo).toBe('bar')
    })

    it('fetch returns a promise: router.handle(request).then(response => {})', async () => {
      let response = await router.handle(request('/params/bar')).then(r => r.status)
      expect(response).toBe(200)
    })
  })

  describe('SIGNATURES (for easier environment compatability)', () => {
    it('router.handle => { fetch: router.handle }', async () => {
      expect(router.fetch).toBe(router.handle)
    })
  })

  describe('OPTIONS', () => {
    describe('after?: anyFunction(request, ...args)', () => {
      it('fires after response is complete', async () => {
        let after = vi.fn(r => r)
        let response = await createRouter(AutoRouter({ after })).fetch(request('/items'))
        expect(after).toHaveBeenCalled()
        expect(after).toHaveReturnedWith(response)
      })
      it('modifies the final response if a return is given', async () => {
        let after = () => 'foo'
        let response = await createRouter(AutoRouter({ after })).fetch(request('/items'))
        expect(response).toBe('foo')
      })
      it('does NOT modify the final response if returning undefined or nothing', async () => {
        let after = (r) => {}
        let response = await createRouter(AutoRouter({ after })).fetch(request('/items'))
        expect(response.status).toBe(200)
      })
      it('can be used with before to recieve information via request', async () => {
        let before = (request) => { request.start = 'foo' }
        let after = vi.fn((_, { start }) => 'foo')
        await createRouter(AutoRouter({ after })).fetch(request('/items'))
        expect(after).toHaveReturnedWith('foo')
      })
      it('has access to the response and request', async () => {
        let after = vi.fn(({ status }, { method, url }) => ({
          status,
          method,
        }))
        await createRouter(AutoRouter({ after })).fetch(request('/items'))
        expect(after).toHaveReturnedWith({
          status: 200,
          method: 'GET',
        })
      })
      it('can be used with before to recieve information via request', async () => {
        let before = (request) => { request.start = 'foo' }
        let after = vi.fn((_, { start }) => 'foo')
        await createRouter(AutoRouter({ after })).fetch(request('/items'))
        expect(after).toHaveReturnedWith('foo')
      })
    })

    describe('before?: anyFunction(request, ...args)', () => {
      it('fires before request is handled', async () => {
        let before = vi.fn()
        await createRouter(AutoRouter({ before })).fetch(request('/items'))
        expect(before).toHaveBeenCalled()
      })
      it('has access to the request', async () => {
        let before = vi.fn(({ method }) => method)
        await createRouter(AutoRouter({ before })).fetch(request('/items'))
        expect(before).toHaveReturnedWith('GET')
      })
    })

    describe('cors?: CorsOptions | true', () => {
      it('will embed CORS headers if provided', async () => {
        let response = await createRouter(AutoRouter({
          cors: {
            methods: ['GET', 'POST'],
          },
        })).fetch(request('/items'))
        expect(response.headers.get('access-control-allow-methods')).toBe('GET, POST')
      })

      it('will embed default CORS headers if set to true', async () => {
        let response = await createRouter(AutoRouter({ cors: true })).fetch(request('/items'))
        expect(response.headers.get('access-control-allow-methods')).toBe('*')
      })
    })

    describe('errors?: Function | false', () => {
      it('should handle custom error function', async () => {
        const customError = () => ({ status: 418, body: 'I\'m a teapot' })
        let response = await createRouter(AutoRouter({ errors: customError })).fetch(request('/throw'))
        expect(response.status).toBe(418)
        expect(response.body).toBe('I\'m a teapot')
      })

      it('should not handle errors if set to false', async () => {
        const errorHandler = vi.fn()
        await createRouter(AutoRouter({ errors: false })).fetch(request('/throw')).catch(errorHandler)
        expect(errorHandler).toHaveBeenCalled()
      })
    })

    describe('format?: Function | false', () => {
      it('should handle custom format function', async () => {
        const customFormat = (data) => ({ status: 200, body: `num items = ${data.length}` })
        let response = await createRouter(AutoRouter({ format: customFormat })).fetch(request('/items'))
        expect(response.status).toBe(200)
        expect(response.body).toBe('num items = 3')
      })

      it('should not format response if set to false', async () => {
        let response = await createRouter(AutoRouter({ format: false })).fetch(request('/items'))
        expect(response.body).toBeUndefined()
      })
    })

    describe('notFound?: Function | false', () => {
      it('should return a 404 by default', async () => {
        let response = await router.handle(request('/missing'))
        expect(response.status).toBe(404)
      })

      it('can accept a custom function', async () => {
        const notFound = () => error(418)
        let response = await createRouter(AutoRouter({ notFound })).fetch(request('/missing'))
        expect(response.status).toBe(418)
      })

      it('will not catch a missing route if set to false', async () => {
        let response = await AutoRouter({ notFound: false }).handle(request('/missing'))
        expect(response).toBeUndefined()
      })
    })
  })
})

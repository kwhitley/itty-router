import 'isomorphic-fetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import { error } from './error'
import { flow } from './flow'

const request = (path: string, method: string = 'GET') =>
  ({ method, url: `https://itty.dev${path}` })

let router

beforeEach(() => {
  router = Router()
            .get('/', () => 'index')
            .get('/items', () => [])
            .get('/throw', (r) => r.a.b.c)
})

describe('flow(router: RouterType, options: FlowOptions): RequestHandler', () => {
  it('should return a fully functional router.handle flow', async () => {
    let response = await flow(router)(request('/'))
    expect(response.status).toBe(200)
  })

  describe('DEFAULT BEHAVIOR', () => {
    it('includes a default 404 handler', async () => {
      let response = await flow(router)(request('/missing')).then(r => r.json())
      expect(response.status).toBe(404)
    })

    it('formats as json', async () => {
      let response = await flow(router)(request('/items')).then(r => r.json())
      expect(response).toEqual([])
    })

    it('catches errors', async () => {
      let response = await flow(router)(request('/throw'))

      expect(response.status).toBe(500)
    })

    it('does not include CORS', async () => {
      let response = await flow(router)(request('/items'))

      expect(response.headers.get('access-control-allow-methods')).toBe(null)
    })
  })

  describe('OPTIONS', () => {
    describe('cors?: CorsOptions | true', () => {
      it('will embed CORS headers if provided', async () => {
        let response = await flow(router, {
          cors: {
            methods: ['GET', 'POST'],
          },
        })(request('/items'))

        expect(response.headers.get('access-control-allow-methods')).toBe('GET, POST')
      })

      it('will embed default CORS headers if set to true', async () => {
        let response = await flow(router, { cors: true })(request('/items'))

        expect(response.headers.get('access-control-allow-methods')).toBe('GET')
      })
    })

    describe('error?: RouteHandler | false', () => {
      it('does not catch internally if set to false', async () => {
        let onError = vi.fn()
        let response = await flow(router, { handleErrors: false })(request('/throw')).catch(onError)

        expect(onError).toHaveBeenCalled()
      })

      it('can reshape errors if provided', async () => {
        let response = await flow(router, {
          handleErrors: () => error(418, 'CUSTOM'),
        })(request('/throw'))

        expect(response.status).toBe(418)
      })
    })

    describe('format?: ResponseFormatter | false', () => {
      it('does not catch internally if set to false', async () => {
        let onError = vi.fn()
        let response = await flow(router, { handleErrors: false })(request('/throw')).catch(onError)

        expect(onError).toHaveBeenCalled()
      })

      it('can reshape errors if provided', async () => {
        let response = await flow(router, {
          handleErrors: () => error(418, 'CUSTOM'),
        })(request('/throw'))

        expect(response.status).toBe(418)
      })
    })

    describe('notFound?: RouteHandler | false', () => {
      it('uses a custom 404 handler', async () => {
        let response = await flow(router, {
          handleNotFound: () => error(418, 'CUSTOM'),
        })(request('/missing')).then(r => r.json())

        expect(response.status).toBe(418)
        expect(response.error).toBe('CUSTOM')
      })

      it('if set to false, will not add notFound handler (allow undefined passthrough)', async () => {
        let response = await flow(router, {
          handleNotFound: false,
          format: false,
        })(request('/missing'))

        expect(response).toBe(undefined)
      })
    })
  })
})

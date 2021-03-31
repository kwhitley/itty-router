require('isomorphic-fetch')

const { Router } = require('./itty-router')

const ERROR_MESSAGE = 'Error Message'

describe('Router', () => {
  const router = Router()
  const buildRequest = ({
    method = 'GET',
    path,
    url = `https://example.com${path}`,
    ...other
  }) => ({ method, path, url, ...other })
  const extract = ({ params, query }) => ({ params, query })

  const routes = [
    { path: '/', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/first', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'get' },
    { path: '/foo', callback: jest.fn(extract), method: 'post' },
    { path: '/optional/:id?', callback: jest.fn(extract), method: 'get' },
    {
      path: '/passthrough',
      callback: jest.fn(({ path, name }) => ({ path, name })),
      method: 'get',
    },
    {
      path: '/passthrough',
      callback: jest.fn(({ path, name }) => ({ path, name })),
    },
    { path: '/wildcards/*', callback: jest.fn(), method: 'get' },
    { path: '*', callback: jest.fn(), method: 'get' },
  ]

  const applyRoutes = (router, routes) => {
    for (const route of routes) {
      router[route.method](route.path, route.callback)
    }

    return router
  }

  applyRoutes(router, routes)

  it('is exported as { Router } from module', () => {
    expect(typeof Router).toBe('function')
  })

  describe('.{method}(route: string, handler1: function, ..., handlerN: function)', () => {
    it('can accept multiple handlers (each mutates request)', async () => {
      const r = Router()
      const handler1 = jest.fn(req => { req.a = 1 })
      const handler2 = jest.fn(req => {
        req.b = 2

        return req
      })
      const handler3 = jest.fn(req => ({ c: 3, ...req }))
      r.get('/multi/:id', handler1, handler2, handler3)

      await r.handle(buildRequest({ path: '/multi/foo' }))

      // expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
      expect(handler3).not.toHaveBeenCalled()
    })
  })

  describe('.handle({ method = \'GET\', url })', () => {

    it('returns { path, query } from match', () => {
      const route = routes.find(r => r.path === '/foo/:id')
      router.handle(buildRequest({ path: '/foo/13?foo=bar&cat=dog' }))

      expect(route.callback).toHaveReturnedWith({
        params: { id: '13' },
        query: { foo: 'bar', cat: 'dog' },
      })
    })

    it('requires exact route match', () => {
      const route = routes.find(r => r.path === '/')

      router.handle(buildRequest({ path: '/foo' }))

      expect(route.callback).not.toHaveBeenCalled()
    })

    it('path of "" works with works with route ending in slash or not', async () => {
      const r = Router()
      const handler = jest.fn()

      r.get('', handler)

      await r.handle(buildRequest({ path: '/' }))
      expect(handler).toHaveBeenCalled()

      await r.handle(buildRequest({ path: '' }))
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('path of "/" works with route ending in slash or not', async () => {
      const r = Router()
      const handler = jest.fn()

      r.get('/', handler)

      await r.handle(buildRequest({ path: '/' }))
      expect(handler).toHaveBeenCalled()

      await r.handle(buildRequest({ path: '' }))
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('path of "/:id" works without leading slash', async () => {
      const r = Router()
      const handler = jest.fn(req => req.params.id)

      r.get('/:id?', handler)

      await r.handle(buildRequest({ path: '/13' }))
      expect(handler).toHaveReturnedWith('13')

      await r.handle(buildRequest({ path: '' }))
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('path of "/:id.:format?" works', async () => {
      const r = Router()
      const handler = jest.fn(req => req.params)

      r.get('/:id.:format?', handler)

      await r.handle(buildRequest({ path: '/13' }))
      expect(handler).toHaveReturnedWith({ id: '13', format: undefined })

      await r.handle(buildRequest({ path: '/13.jpg' }))
      expect(handler).toHaveReturnedWith({ id: '13', format: 'jpg' })
    })

    it('can accept dot notations (e.g. domains) as a route param', async () => {
      const r = Router()
      const handler = jest.fn(req => req.params.url)

      r.get('/:url/etc', handler)

      await r.handle(buildRequest({ path: '/domain.dev/etc' }))
      expect(handler).toHaveReturnedWith('domain.dev')
    })

    it('match earliest routes that match', () => {
      const route = routes.find(r => r.path === '/foo/first')
      router.handle(buildRequest({ path: '/foo/first' }))

      expect(route.callback).toHaveBeenCalled()
    })

    it('honors correct method (e.g. GET, POST, etc)', () => {
      const route = routes.find(r => r.path === '/foo' && r.method === 'post')
      router.handle(buildRequest({ method: 'POST', path: '/foo' }))

      expect(route.callback).toHaveBeenCalled()
    })

    it('handles optional params (e.g. /foo/:id?)', () => {
      const route = routes.find(r => r.path === '/optional/:id?')

      router.handle(buildRequest({ path: '/optional' }))
      expect(route.callback).toHaveBeenCalled()

      router.handle(buildRequest({ path: '/optional/13' }))
      expect(route.callback).toHaveBeenCalledTimes(2)
    })

    it('passes the entire original request through to the handler', () => {
      const route = routes.find(r => r.path === '/passthrough')
      router.handle(buildRequest({ path: '/passthrough', name: 'miffles' }))

      expect(route.callback).toHaveReturnedWith({
        path: '/passthrough',
        name: 'miffles',
      })
    })

    it('accepts * as a wildcard route (e.g. for use in 404)', () => {
      const route = routes.find(r => r.path === '*')
      router.handle(buildRequest({ path: '/missing' }))

      expect(route.callback).toHaveBeenCalled()

      const route2 = routes.find(r => r.path === '/wildcards/*')
      router.handle(buildRequest({ path: '/wildcards/missing' }))

      expect(route2.callback).toHaveBeenCalled()
    })

    it('allows missing handler later in flow with "all" channel', () => {
      const missingHandler = jest.fn()
      const matchHandler = jest.fn()

      const router1 = Router()
      const router2 = Router({ base: '/nested' })

      router2.get('/foo', matchHandler)
      router1
        .all('/nested/*', router2.handle)
        .all('*', missingHandler)

      router1.handle(buildRequest({ path: '/foo' }))
      expect(missingHandler).toHaveBeenCalled()

      router1.handle(buildRequest({ path: '/nested/foo' }))
      expect(matchHandler).toHaveBeenCalled()
    })

    it('defaults to GET assumption when handling new requests without { method: \'METHOD\' }', () => {
      const route = routes.find(r => r.path === '/foo')
      router.handle({ url: 'https://example.com/foo' }) // no method listed

      expect(route.callback).toHaveBeenCalled()
    })

    it('won\'t throw on unknown method', () => {
      expect(() => router.handle({ method: 'CUSTOM', url: 'https://example.com/foo' })).not.toThrow()
    })

    it('can match multiple routes if earlier handlers do not return (as middleware)', async () => {
      const r = Router()

      const middleware = req => {
        req.user = { id: 13 }
      }

      const handler = jest.fn(req => req.user.id)

      r.get('/middleware/*', middleware)
      r.get('/middleware/:id', handler)

      await r.handle(buildRequest({ path: '/middleware/foo' }))

      expect(handler).toHaveBeenCalled()
      expect(handler).toHaveReturnedWith(13)
    })

    it('can accept a basepath for routes', async () => {
      const router = Router({ base: '/api' })
      const handler = jest.fn()
      router.get('/foo/:id?', handler)

      router.handle(buildRequest({ path: '/api/foo' }))
      expect(handler).toHaveBeenCalled()

      await router.handle(buildRequest({ path: '/api/foo/13' }))
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('can pull route params from the basepath as well', async () => {
      const router = Router({ base: '/:collection' })
      const handler = jest.fn(req => req.params)
      router.get('/:id', handler)

      await router.handle(buildRequest({ path: '/todos/13' }))
      expect(handler).toHaveBeenCalled()
      expect(handler).toHaveReturnedWith({ collection: 'todos', id: '13' })
    })

    it('gracefully handles trailing slashes', async () => {
      const r = Router()

      const middleware = req => {
        req.user = { id: 13 }
      }

      const handler = jest.fn(req => req.user.id)

      r.get('/middleware/*', middleware)
      r.get('/middleware', handler)

      await r.handle(buildRequest({ path: '/middleware' }))

      expect(handler).toHaveBeenCalled()
      expect(handler).toHaveReturnedWith(13)

      await r.handle(buildRequest({ path: '/middleware/' }))

      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('allow wildcards in the middle of paths', async () => {
      const r = Router()
      const handler = jest.fn()

      r.get('/foo/*/end', handler)

      await r.handle(buildRequest({ path: '/foo/bar/baz/13/end' }))

      expect(handler).toHaveBeenCalled()
    })

    it('can handle nested routers', async () => {
      const router1 = Router()
      const router2 = Router({ base: '/nested' })
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      const handler3 = jest.fn()
      router1.get('/pet', handler1)
      router1.get('/nested/*', router2.handle)
      router2.get('/', handler3)
      router2.get('/bar/:id?', handler2)

      await router1.handle(buildRequest({ path: '/pet' }))
      expect(handler1).toHaveBeenCalled()

      await router1.handle(buildRequest({ path: '/nested/bar' }))
      expect(handler2).toHaveBeenCalled()

      await router1.handle(buildRequest({ path: '/nested' }))
      expect(handler3).toHaveBeenCalled()
    })

    it('allows any method to match an "all" route', async () => {
      const router = Router()
      const handler = jest.fn()
      router.all('/crud/*', handler)

      await router.handle(buildRequest({ path: '/crud/foo' }))
      expect(handler).toHaveBeenCalled()

      await router.handle(buildRequest({ method: 'POST', path: '/crud/bar' }))
      expect(handler).toHaveBeenCalledTimes(2)

      await router.handle(buildRequest({ method: 'UPDATE', path: '/crud/baz' }))
      expect(handler).toHaveBeenCalledTimes(3)
    })

    it('stops at a handler that throws', async () => {
      const router = Router()
      const handler1 = jest.fn(() => {})
      const handler2 = jest.fn(() => { throw new Error() })
      const handler3 = jest.fn(() => {})
      router.get('/foo', handler1, handler2, handler3)

      const escape = err => err

      await router
        .handle(buildRequest({ path: '/foo' }))
        .catch(escape)

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
      expect(handler3).not.toHaveBeenCalled()
    })

    it('can throw an error and still handle if using catch', async () => {
      const router = Router()
      const handlerWithError = jest.fn(() => { throw new Error(ERROR_MESSAGE) })
      const errorHandler = jest.fn(err => err.message)

      router.get('/foo', handlerWithError)

      await router
        .handle(buildRequest({ path: '/foo' }))
        .catch(errorHandler)

      expect(handlerWithError).toHaveBeenCalled()
      expect(errorHandler).toHaveBeenCalled()
      expect(errorHandler).toHaveReturnedWith(ERROR_MESSAGE)
    })

    it('can easily create a ThrowableRouter', async () => {
      const error = (status, message) => new Response(message, { status })
      const errorResponse = err => error(err.status || 500, err.message)

      const ThrowableRouter = options => new Proxy(Router(options), {
        get: (obj, prop) => (...args) =>
            prop === 'handle'
            ? obj[prop](...args).catch(err => error(err.status || 500, err.message))
            : obj[prop](...args)
      })

      const router = ThrowableRouter()
      const handlerWithError = jest.fn(() => { throw new Error(ERROR_MESSAGE) })

      router.get('/foo', handlerWithError)

      const response = await router.handle(buildRequest({ path: '/foo' }))

      expect(response instanceof Response).toBe(true)
      expect(response.status).toBe(500)
      expect(await response.text()).toBe(ERROR_MESSAGE)
    })

    it('requires exact path match unless wildcard', async () => {
      const router = Router()
      const handler = jest.fn()
      router.get('/foo', handler)

      await router.handle(buildRequest({ path: '/a/foo' })) // test prefix
      expect(handler).not.toHaveBeenCalled()

      await router.handle(buildRequest({ path: '/foo/d' })) // test suffix
      expect(handler).not.toHaveBeenCalled()

      await router.handle(buildRequest({ path: '/foo' })) // test exact
      expect(handler).toHaveBeenCalled()
    })

    it('allows chaining', () => {
      const router = Router()

      expect(() => {
        router
          .get('/foo', jest.fn())
          .get('/foo', jest.fn())

      }).not.toThrow()
    })
  })

  describe('.handle({ method = \'GET\', url }, ...args)', () => {
    it('passes extra args to each handler', async () => {
      const r = Router()
      const h = (req, a, b) => { req.a = a; req.b = b }
      const originalA = 'A'
      const originalB = {}
      r.get('*', h)
      const req = buildRequest({ path: '/foo', })

      await r.handle(req, originalA, originalB)

      expect(req.a).toBe(originalA)
      expect(req.b).toBe(originalB)
    })

    it('will pass request.proxy instead of request if found', async () => {
      const router = Router()
      const handler = jest.fn(req => req)
      let proxy

      const withProxy = request => {
        request.proxy = proxy = new Proxy(request, {})
      }

      router.get('/foo', withProxy, handler)

      await router.handle(buildRequest({ path: '/foo' }))

      expect(handler).toHaveReturnedWith(proxy)
    })
  })
})

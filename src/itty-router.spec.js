require('isomorphic-fetch')

const { Router } = require('./itty-router')
const { buildRequest, extract, createTestRunner } = require('../test-utils')

const ERROR_MESSAGE = 'Error Message'

const testRoutes = createTestRunner(Router)

describe('Router', () => {
  const router = Router()

  const routes = [
    { path: '/', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/first', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'get' },
    { path: '/foo', callback: jest.fn(extract), method: 'post' },
    {
      path: '/passthrough',
      callback: jest.fn(({ path, name }) => ({ path, name })),
      method: 'get',
    },
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

  it('allows introspection', () => {
    const r = []
    const config = { routes: r }
    const router = Router(config)

    router
      .get('/foo', () => {})
      .patch('/bar', () => {})
      .post('/baz', () => {})

    expect(r.length).toBe(3) // can pass in the routes directly through "r"
    expect(config.routes.length).toBe(3) // or just look at the mututated config
    expect(router.routes.length).toBe(3) // accessible off the main router
  })

it('allows preloading advanced routes', async () => {
  const basicHandler = jest.fn(req => req.params)
  const customHandler = jest.fn(req => req.params)

  const router = Router({
                  routes: [
                    [ 'GET', /^\/test\.(?<x>[^/]+)\/*$/, [basicHandler] ],
                    [ 'GET', /^\/custom-(?<custom>\d{2,4})$/, [customHandler] ],
                  ]
                })

  await router.handle(buildRequest({ path: '/test.a.b' }))
  expect(basicHandler).toHaveReturnedWith({ x: 'a.b' })

  await router.handle(buildRequest({ path: '/custom-12345' }))
  expect(customHandler).not.toHaveBeenCalled() // custom route mismatch

  await router.handle(buildRequest({ path: '/custom-123' }))
  expect(customHandler).toHaveReturnedWith({ custom: '123' }) // custom route hit
})

it('allows loading advanced routes after config', async () => {
  const handler = jest.fn(req => req.params)

  const router = Router()

  // allows manual loading (after config)
  router.routes.push([ 'GET', /^\/custom2-(?<custom>\w\d{3})$/, [handler] ])

  await router.handle(buildRequest({ path: '/custom2-a456' }))
  expect(handler).toHaveReturnedWith({ custom: 'a456' }) // custom route hit
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

      expect(handler2).toHaveBeenCalled()
      expect(handler3).not.toHaveBeenCalled()
    })
  })

  describe('.handle({ method = \'GET\', url })', () => {
    it('returns { path, query } from match', async () => {
      const route = routes.find(r => r.path === '/foo/:id')
      await router.handle(buildRequest({ path: '/foo/13?foo=bar&cat=dog' }))

      expect(route.callback).toHaveReturnedWith({
        params: { id: '13' },
        query: { foo: 'bar', cat: 'dog' },
      })
    })

    it('requires exact route match', async () => {
      const route = routes.find(r => r.path === '/')

      await router.handle(buildRequest({ path: '/foo' }))

      expect(route.callback).not.toHaveBeenCalled()
    })

    it('match earliest routes that match', async () => {
      const route = routes.find(r => r.path === '/foo/first')
      await router.handle(buildRequest({ path: '/foo/first' }))

      expect(route.callback).toHaveBeenCalled()
    })

    it('honors correct method (e.g. GET, POST, etc)', async () => {
      const route = routes.find(r => r.path === '/foo' && r.method === 'post')
      await router.handle(buildRequest({ method: 'POST', path: '/foo' }))

      expect(route.callback).toHaveBeenCalled()
    })

    it('passes the entire original request through to the handler', async () => {
      const route = routes.find(r => r.path === '/passthrough')
      await router.handle(buildRequest({ path: '/passthrough', name: 'miffles' }))

      expect(route.callback).toHaveReturnedWith({
        path: '/passthrough',
        name: 'miffles',
      })
    })

    it('allows missing handler later in flow with "all" channel', async () => {
      const missingHandler = jest.fn()
      const matchHandler = jest.fn()

      const router1 = Router()
      const router2 = Router({ base: '/nested' })

      router2.get('/foo', matchHandler)
      router1
        .all('/nested/*', router2.handle)
        .all('*', missingHandler)

      await router1.handle(buildRequest({ path: '/foo' }))
      expect(missingHandler).toHaveBeenCalled()

      await router1.handle(buildRequest({ path: '/nested/foo' }))
      expect(matchHandler).toHaveBeenCalled()
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

      await router.handle(buildRequest({ path: '/api/foo' }))
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

    it('can throw method not allowed error', async () => {
      const router = Router()
      const errorText = 'Not Allowed'
      const okText = 'OK'
      const errorResponse = new Response(JSON.stringify({ foo: 'bar' }), {
        headers: { 'content-type': 'application/json;charset=UTF-8' },
        status: 405,
        statusText: 'Method not allowed',
      })
      const handler = jest.fn(() => new Response(okText))
      const middleware = jest.fn()
      const errorHandler = jest.fn(() => errorResponse)

      router
        .post('*', middleware, handler)
        .all('*', errorHandler)

      // creates a request (with passed method) with JSON body
      const createRequest = method => new Request('https://foo.com/foo', {
        method,
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ foo: 'bar' })
      })

      // test POST with JSON body (catch by post handler)
      let response = await router.handle(createRequest('post'))

      expect(handler).toHaveBeenCalled()
      expect(middleware).toHaveBeenCalled()
      expect(errorHandler).not.toHaveBeenCalled()
      expect(await response.text()).toBe(okText)

      // test PUT with json body (will flow to all/errorHandler)
      response = await router.handle(createRequest('put'))

      expect(handler).toHaveBeenCalledTimes(1)
      expect(errorHandler).toHaveBeenCalled()
      expect(await response.json()).toEqual({ foo: 'bar' })
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

    it('can handle POST body even if not used', async () => {
      const router = Router()
      const handler = jest.fn(req => req.json())
      const errorHandler = jest.fn()

      router
        .post('/foo', handler)
        .all('*', errorHandler)

      const createRequest = method => new Request('https://foo.com/foo', {
        method,
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ foo: 'bar' })
      })

      await router.handle(createRequest('put'))
      expect(errorHandler).toHaveBeenCalled()

      const response = await router.handle(createRequest('post'))
      expect(handler).toHaveBeenCalled()
      expect(await response).toEqual({ foo: 'bar' })
    })
  })

  describe('ROUTE MATCHING', () => {
    describe('allowed characters', () => {
      const chars = '/foo/-.abc!@%&_=:;\',~|/bar'
      testRoutes([
        { route: chars, path: chars },
      ])
    })

    describe('dots', () => {
      testRoutes([
        { route: '/foo.json', path: '/foo.json' },
        { route: '/foo.json', path: '/fooXjson', returns: false },
      ])
    })

    describe('formats/extensions', () => {
      testRoutes([
        { route: '/:id.:format', path: '/foo', returns: false },
        { route: '/:id.:format', path: '/foo.jpg', returns: { id: 'foo', format: 'jpg' } },
        { route: '/:id.:format', path: '/foo.bar.jpg', returns: { id: 'foo.bar', format: 'jpg' } },
        { route: '/:id.:format?', path: '/foo', returns: { id: 'foo' } },
        // { route: '/:id.:format?', path: '/foo.bar.jpg', returns: { id: 'foo.bar', format: 'jpg' }, log: true }, // FAILING TEST - known bug
        // { route: '/:id.:format?', path: '/foo.jpg', returns: { id: 'foo', format: 'jpg' }, log: true }, // FAILING TEST - known bug
        { route: '/:id.:format?', path: '/foo', returns: { id: 'foo' } },
      ])
    })

    describe('optional params', () => {
      testRoutes([
        { route: '/foo/:id?', path: '/foo' },
        { route: '/foo/:id?', path: '/foo/' },
        { route: '/foo/:id?', path: '/foo/bar', returns: { id: 'bar' } },
      ])
    })

    describe('regex', () => {
      testRoutes([
        { route: '/foo|bar/baz', path: '/foo/baz' },
        { route: '/foo|bar/baz', path: '/bar/baz' },
        { route: '/foo(bar|baz)', path: '/foobar' },
        { route: '/foo(bar|baz)', path: '/foobaz' },
        { route: '/foo(bar|baz)', path: '/foo', returns: false },
        { route: '/foo+', path: '/foo' },
        { route: '/foo+', path: '/fooooooo' },
        { route: '/foo?', path: '/foo' },
        { route: '/foo?', path: '/fo' },
        { route: '/foo?', path: '/fooo', returns: false },
        { route: '/\.', path: '/f' },
        { route: '/\.', path: '/', returns: false },

        { route: '/x|y', path: '/y', returns: true },
        { route: '/x|y', path: '/x', returns: true },
        { route: '/x/y|z', path: '/z', returns: true }, // should require second path as y or z
        { route: '/x/y|z', path: '/x/y', returns: true }, // shouldn't allow the weird pipe
        { route: '/x/y|z', path: '/x/z', returns: true }, // shouldn't allow the weird pipe
        { route: '/xy*', path: '/x', returns: false },
        { route: '/xy*', path: '/xyz', returns: true },
        { route: '/:x.y', path: '/a.x.y', returns: { x: 'a.x' } },
        { route: '/x.y', path: '/xay', returns: false }, // dots are enforced as dots, not any character (e.g. extensions)
        { route: '/xy{2}', path: '/xyxy', returns: false }, // no regex repeating supported
        { route: '/xy{2}', path: '/xy/xy', returns: false }, // no regex repeating supported
        { route: '/:x.:y', path: '/a.b.c', returns: { x: 'a.b', y: 'c' } }, // standard file + extension format
        { route: '/test.:x', path: '/test.a.b', returns: { x: 'a.b' } }, // dots are still captured as part of the param
        { route: '/:x?.y', path: '/test.y', returns: { x: 'test' } },
        { route: '/x/:y*', path: '/x/test', returns: { y: 'test' } },
      ])
    })

    describe('trailing/leading slashes', () => {
      testRoutes([
        { route: '/foo/bar', path: '/foo/bar' },
        { route: '/foo/bar', path: '/foo/bar/' },
        { route: '/foo/bar/', path: '/foo/bar/' },
        { route: '/foo/bar/', path: '/foo/bar' },
        { route: '/', path: '/' },
        { route: '', path: '/' },
      ])
    })

    describe('wildcards', () => {
      testRoutes([
        { route: '*', path: '/something/foo' },
        { route: '/*/foo', path: '/something/foo' },
        { route: '/*/foo', path: '/something/else/foo' },
        { route: '/foo/*/bar', path: '/foo/a/b/c/bar' },
      ])
    })
  })
})

import 'isomorphic-fetch'
import { describe, expect, it, vi } from 'vitest'
import { buildRequest, createTestRunner, extract } from '../test'
import { Router } from './Router'

const ERROR_MESSAGE = 'Error Message'

const testRoutes = createTestRunner(Router)

describe('Router', () => {
  const router = Router()

  const routes = [
    { path: '/', callback: vi.fn(extract), method: 'get' },
    { path: '/foo/first', callback: vi.fn(extract), method: 'get' },
    { path: '/foo/:id', callback: vi.fn(extract), method: 'get' },
    { path: '/foo', callback: vi.fn(extract), method: 'post' },
    {
      path: '/passthrough',
      callback: vi.fn(({ path, name }) => ({ path, name })),
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
    const basicHandler = vi.fn((req) => req.params)
    const customHandler = vi.fn((req) => req.params)

    const router = Router({
      routes: [
        ['GET', /^\/test\.(?<x>[^/]+)\/*$/, [basicHandler], '/test'],
        ['GET', /^\/custom-(?<custom>\d{2,4})$/, [customHandler], '/custom'],
      ],
    })

    await router.handle(buildRequest({ path: '/test.a.b' }))
    expect(basicHandler).toHaveReturnedWith({ x: 'a.b' })

    await router.handle(buildRequest({ path: '/custom-12345' }))
    expect(customHandler).not.toHaveBeenCalled() // custom route mismatch

    await router.handle(buildRequest({ path: '/custom-123' }))
    expect(customHandler).toHaveReturnedWith({ custom: '123' }) // custom route hit
  })

  it('allows loading advanced routes after config', async () => {
    const handler = vi.fn((req) => req.params)

    const router = Router()

    // allows manual loading (after config)
    router.routes.push(['GET', /^\/custom2-(?<custom>\w\d{3})$/, [handler], '/custom'])

    await router.handle(buildRequest({ path: '/custom2-a456' }))
    expect(handler).toHaveReturnedWith({ custom: 'a456' }) // custom route hit
  })

  describe('.{method}(route: string, handler1: function, ..., handlerN: function)', () => {
    it('can accept multiple handlers (each mutates request)', async () => {
      const r = Router()
      const handler1 = vi.fn((req) => {
        req.a = 1
      })
      const handler2 = vi.fn((req) => {
        req.b = 2

        return req
      })
      const handler3 = vi.fn((req) => ({ c: 3, ...req }))
      r.get('/multi/:id', handler1, handler2, handler3)

      await r.handle(buildRequest({ path: '/multi/foo' }))

      expect(handler2).toHaveBeenCalled()
      expect(handler3).not.toHaveBeenCalled()
    })
  })

  describe(`.handle({ method = 'GET', url })`, () => {
    it('always returns a Promise', () => {
      const syncRouter = Router()
      syncRouter.get('/foo', () => 3)

      const response = syncRouter.handle(buildRequest({ path: '/foo' }))

      expect(typeof response?.then).toBe('function')
      expect(typeof response?.catch).toBe('function')
    })

    it('returns { path, query } from match', async () => {
      const route = routes.find((r) => r.path === '/foo/:id')
      await router.handle(buildRequest({ path: '/foo/13?foo=bar&cat=dog' }))

      expect(route?.callback).toHaveReturnedWith({
        params: { id: '13' },
        query: { foo: 'bar', cat: 'dog' },
      })
    })

    it('BUG: avoids toString prototype bug', async () => {
      const route = routes.find((r) => r.path === '/foo/:id')
      await router.handle(buildRequest({ path: '/foo/13?toString=value' }))

      expect(route?.callback).toHaveReturnedWith({
        params: { id: '13' },
        query: { toString: 'value' },
      })
    })

    it('requires exact route match', async () => {
      const route = routes.find((r) => r.path === '/')

      await router.handle(buildRequest({ path: '/foo' }))

      expect(route?.callback).not.toHaveBeenCalled()
    })

    it('returns { method, route } from matched route', async () => {
      const route1 = '/foo/bar/:baz+'
      const route2 = '/items'
      const handler = vi.fn(({ method, route }) => ({ method, route }))

      const router = Router()
      router.get(route1, handler).post(route2, handler)

      await router.handle(buildRequest({ path: route1, method: 'GET' }))
      expect(handler).toHaveReturnedWith({ method: 'GET', route: route1 })

      await router.handle(buildRequest({ path: route2, method: 'POST' }))
      expect(handler).toHaveReturnedWith({ method: 'POST', route: route2 })
    })

    it('match earliest routes that match', async () => {
      const router = Router()
      const handler1 = vi.fn(() => 1)
      const handler2 = vi.fn(() => 1)
      router.get('/foo/static', handler1)
      router.get('/foo/:id', handler2)

      await router.handle(buildRequest({ path: '/foo/static' }))
      expect(handler1).toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()

      await router.handle(buildRequest({ path: '/foo/3' }))
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalled()
    })

    it('honors correct method (e.g. GET, POST, etc)', async () => {
      const route = routes.find((r) => r.path === '/foo' && r.method === 'post')
      await router.handle(buildRequest({ method: 'POST', path: '/foo' }))

      expect(route.callback).toHaveBeenCalled()
    })

    it('passes the entire original request through to the handler', async () => {
      const route = routes.find((r) => r.path === '/passthrough')
      await router.handle(
        buildRequest({ path: '/passthrough', name: 'miffles' })
      )

      expect(route.callback).toHaveReturnedWith({
        path: '/passthrough',
        name: 'miffles',
      })
    })

    it('allows missing handler later in flow with "all" channel', async () => {
      const missingHandler = vi.fn()
      const matchHandler = vi.fn()

      const router1 = Router()
      const router2 = Router({ base: '/nested' })

      router2.get('/foo', matchHandler)
      router1.all('/nested/*', router2.handle).all('*', missingHandler)

      await router1.handle(buildRequest({ path: '/foo' }))
      expect(missingHandler).toHaveBeenCalled()

      await router1.handle(buildRequest({ path: '/nested/foo' }))
      expect(matchHandler).toHaveBeenCalled()
    })

    it(`won't throw on unknown method`, () => {
      expect(() =>
        router.handle({ method: 'CUSTOM', url: 'https://example.com/foo' })
      ).not.toThrow()
    })

    it('can match multiple routes if earlier handlers do not return (as middleware)', async () => {
      const r = Router()

      const middleware = (req) => {
        req.user = { id: 13 }
      }

      const handler = vi.fn((req) => req.user.id)

      r.get('/middleware/*', middleware)
      r.get('/middleware/:id', handler)

      await r.handle(buildRequest({ path: '/middleware/foo' }))

      expect(handler).toHaveBeenCalled()
      expect(handler).toHaveReturnedWith(13)
    })

    it('can accept a basepath for routes', async () => {
      const router = Router({ base: '/api' })
      const handler = vi.fn()
      router.get('/foo/:id?', handler)

      await router.handle(buildRequest({ path: '/api/foo' }))
      expect(handler).toHaveBeenCalled()

      await router.handle(buildRequest({ path: '/api/foo/13' }))
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('basepath works with "/"', async () => {
      const router = Router({ base: '/' })
      const handler = vi.fn()
      router.get('/foo/:id?', handler)

      await router.handle(buildRequest({ path: '/foo' }))
      expect(handler).toHaveBeenCalled()
    })

    it('can pull route params from the basepath as well', async () => {
      const router = Router({ base: '/:collection' })
      const handler = vi.fn((req) => req.params)
      router.get('/:id', handler)

      await router.handle(buildRequest({ path: '/todos/13' }))
      expect(handler).toHaveBeenCalled()
      expect(handler).toHaveReturnedWith({ collection: 'todos', id: '13' })
    })

    it('allows any method to match an "all" route', async () => {
      const router = Router()
      const handler = vi.fn()
      router.all('/crud/*', handler)

      await router.handle(buildRequest({ path: '/crud/foo' }))
      expect(handler).toHaveBeenCalled()

      await router.handle(buildRequest({ method: 'POST', path: '/crud/bar' }))
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('stops at a handler that throws', async () => {
      const router = Router()
      const handler1 = vi.fn()
      const handler2 = vi.fn(() => {
        throw new Error()
      })
      const handler3 = vi.fn()
      router.get('/foo', handler1, handler2, handler3)

      const escape = (err) => err

      await router.handle(buildRequest({ path: '/foo' })).catch(escape)

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
      expect(handler3).not.toHaveBeenCalled()
    })

    it('can throw an error and still handle if using catch', async () => {
      const router = Router()
      const handlerWithError = vi.fn(() => {
        throw new Error(ERROR_MESSAGE)
      })
      const errorHandler = vi.fn((err) => err.message)

      router.get('/foo', handlerWithError)

      await router.handle(buildRequest({ path: '/foo' })).catch(errorHandler)

      expect(handlerWithError).toHaveBeenCalled()
      expect(errorHandler).toHaveBeenCalled()
      expect(errorHandler).toHaveReturnedWith(ERROR_MESSAGE)
    })

    it('can throw method not allowed error', async () => {
      const router = Router()
      const okText = 'OK'
      const errorResponse = new Response(JSON.stringify({ foo: 'bar' }), {
        headers: { 'content-type': 'application/json;charset=UTF-8' },
        status: 405,
        statusText: 'Method not allowed',
      })
      const handler = vi.fn(() => new Response(okText))
      const middleware = vi.fn()
      const errorHandler = vi.fn(() => errorResponse)

      router.post('*', middleware, handler).all('*', errorHandler)

      // creates a request (with passed method) with JSON body
      const createRequest = (method) =>
        new Request('https://foo.com/foo', {
          method,
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ foo: 'bar' }),
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

      const ThrowableRouter = (options = {}) =>
        new Proxy(Router(options), {
          get:
            (obj, prop) =>
            (...args) =>
              prop === 'handle'
                ? obj[prop](...args).catch((err) =>
                    error(err.status || 500, err.message)
                  )
                : obj[prop](...args),
        })

      const router = ThrowableRouter()
      const handlerWithError = vi.fn(() => {
        throw new Error(ERROR_MESSAGE)
      })

      router.get('/foo', handlerWithError)

      const response = await router.handle(buildRequest({ path: '/foo' }))

      expect(response instanceof Response).toBe(true)
      expect(response.status).toBe(500)
      expect(await response.text()).toBe(ERROR_MESSAGE)
    })

    it('allows chaining', () => {
      const router = Router()

      expect(() => {
        router.get('/foo', vi.fn()).get('/foo', vi.fn())
      }).not.toThrow()
    })
  })

  describe(`.handle({ method = 'GET', url }, ...args)`, () => {
    it('passes extra args to each handler', async () => {
      const r = Router()
      const h = (req, a, b) => {
        req.a = a
        req.b = b
      }
      const originalA = 'A'
      const originalB = {}
      r.get('*', h)
      const req = buildRequest({ path: '/foo' })

      await r.handle(req, originalA, originalB)

      expect(req.a).toBe(originalA)
      expect(req.b).toBe(originalB)
    })

    it('will pass request.proxy instead of request if found', async () => {
      const router = Router()
      const handler = vi.fn((req) => req)
      let proxy

      const withProxy = (request) => {
        request.proxy = proxy = new Proxy(request, {})
      }

      router.get('/foo', withProxy, handler)

      await router.handle(buildRequest({ path: '/foo' }))

      expect(handler).toHaveReturnedWith(proxy)
    })

    it('can handle POST body even if not used', async () => {
      const router = Router()
      const handler = vi.fn((req) => req.json())
      const errorHandler = vi.fn()

      router.post('/foo', handler).all('*', errorHandler)

      const createRequest = (method) =>
        new Request('https://foo.com/foo', {
          method,
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ foo: 'bar' }),
        })

      await router.handle(createRequest('put'))
      expect(errorHandler).toHaveBeenCalled()

      const response = await router.handle(createRequest('post'))
      expect(handler).toHaveBeenCalled()
      expect(await response).toEqual({ foo: 'bar' })
    })
  })

  it('can get query params', async () => {
    const router = Router()
    const handler = vi.fn((req) => req.query)

    router.get('/foo', handler)

    const request = new Request(
      'https://foo.com/foo?cat=dog&foo=bar&foo=baz&missing='
    )

    await router.handle(request)
    expect(handler).toHaveReturnedWith({
      cat: 'dog',
      foo: ['bar', 'baz'],
      missing: '',
    })
  })

  it('can still get query params with POST or non-GET HTTP methods', async () => {
    const router = Router()
    const handler = vi.fn((req) => req.query)

    router.post('/foo', handler)

    const request = new Request('https://foo.com/foo?cat=dog&foo=bar&foo=baz', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ success: true }),
    })

    await router.handle(request)
    expect(handler).toHaveReturnedWith({ cat: 'dog', foo: ['bar', 'baz'] })
  })
})

describe('NESTING', () => {
  it('can handle legacy nested routers (with explicit base path)', async () => {
    const router1 = Router()
    const router2 = Router({ base: '/nested' })
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const handler3 = vi.fn()
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

  it('can pass routers as handlers (WITHOUT explicit base path)', async () => {
    const grandchild = Router().get('/', () => 'grandchild')
    const child = Router()
                    .get('/', () => 'child')
                    .get('/grandchild/*', grandchild)
    const parent = Router()
                    .get('/', () => 'parent')
                    .all('/child/*', child)

    expect(await parent.handle(buildRequest({ path: '/' }))).toBe('parent')
    expect(await parent.handle(buildRequest({ path: '/child' }))).toBe('child')
    expect(await parent.handle(buildRequest({ path: '/child/grandchild' }))).toBe('grandchild')
  })

  it('can nest with route params on the nested route (only if given child base path)', async () => {
    const child = Router({ base: '/child/:bar' }).get('/', () => 'child')
    const parent = Router()
                    .get('/', () => 'parent')
                    .all('/child/:bar/*', child)

    console.log({ child: child.routes, parent: parent.routes })

    expect(await parent.handle(buildRequest({ path: '/' }))).toBe('parent')
    expect(await parent.handle(buildRequest({ path: '/child/kitten' }))).toBe('child')
  })

  it('can nest with route params on the nested route if given router.handle and base path', async () => {
    const child = Router({ base: '/child/:bar' }).get('/', () => 'child')
    const parent = Router()
                    .get('/', () => 'parent')
                    .all('/child/:bar/*', child.handle)

    console.log({ child: child.routes, parent: parent.routes })

    expect(await parent.handle(buildRequest({ path: '/' }))).toBe('parent')
    expect(await parent.handle(buildRequest({ path: '/child/kitten' }))).toBe('child')
  })

  it('can pass routers as handlers (WITH explicit base path)', async () => {
    const grandchild = Router({ base: '/child/grandchild' }).get('/', () => 'grandchild')
    const child = Router({ base: '/child' })
                    .get('/', () => 'child')
                    .get('/grandchild/*', grandchild)
    const parent = Router()
                    .get('/', () => 'parent')
                    .all('/child/*', child)

    expect(await parent.handle(buildRequest({ path: '/' }))).toBe('parent')
    expect(await parent.handle(buildRequest({ path: '/child' }))).toBe('child')
    expect(await parent.handle(buildRequest({ path: '/child/grandchild' }))).toBe('grandchild')
  })
})

describe('MIDDLEWARE', () => {
  it('calls any handler until a return', async () => {
    const router = Router()
    const h1 = vi.fn()
    const h2 = vi.fn()
    const h3 = vi.fn(() => true)

    router.get('*', h1, h2, h3)

    const results = await router.handle(buildRequest({ path: '/' }))
    expect(h1).toHaveBeenCalled()
    expect(h2).toHaveBeenCalled()
    expect(h3).toHaveBeenCalled()
    expect(results).toBe(true)
  })
})

describe('ROUTE MATCHING', () => {
  describe('allowed characters', () => {
    const chars = `/foo/-.abc!@%&_=:;',~|/bar`
    testRoutes([{ route: chars, path: chars }])
  })

  describe('dots', () => {
    testRoutes([
      { route: '/foo.json', path: '/foo.json' },
      { route: '/foo.json', path: '/fooXjson', returns: false },
    ])
  })

  describe('greedy params', () => {
    testRoutes([
      { route: '/foo/:id+', path: '/foo/14', returns: { id: '14' } },
      { route: '/foo/:id+', path: '/foo/bar/baz', returns: { id: 'bar/baz' } },
      {
        route: '/foo/:id+',
        path: '/foo/https://foo.bar',
        returns: { id: 'https://foo.bar' },
      },
    ])
  })

  describe('formats/extensions', () => {
    testRoutes([
      { route: '/:id.:format', path: '/foo', returns: false },
      {
        route: '/:id.:format',
        path: '/foo.jpg',
        returns: { id: 'foo', format: 'jpg' },
      },
      {
        route: '/:id.:format',
        path: '/foo.bar.jpg',
        returns: { id: 'foo.bar', format: 'jpg' },
      },
      { route: '/:id.:format?', path: '/foo', returns: { id: 'foo' } },
      {
        route: '/:id.:format?',
        path: '/foo.bar.jpg',
        returns: { id: 'foo.bar', format: 'jpg' },
      },
      {
        route: '/:id.:format?',
        path: '/foo.jpg',
        returns: { id: 'foo', format: 'jpg' },
      },
      { route: '/:id.:format?', path: '/foo', returns: { id: 'foo' } },
      { route: '/:id.:format.:compress', path: '/foo.gz', returns: false },
      {
        route: '/:id.:format.:compress',
        path: '/foo.txt.gz',
        returns: { id: 'foo', format: 'txt', compress: 'gz' },
      },
      {
        route: '/:id.:format.:compress?',
        path: '/foo.txt',
        returns: { id: 'foo', format: 'txt' },
      },
      {
        route: '/:id.:format?.:compress',
        path: '/foo.gz',
        returns: { id: 'foo', compress: 'gz' },
      },
    ])
  })

  describe('optional params', () => {
    testRoutes([
      { route: '/foo/abc:id?', path: '/foo/abcbar', returns: { id: 'bar' } },
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
      { route: '/foo:bar?', path: '/foXbar', returns: false },
      { route: '/foo+', path: '/foo' },
      { route: '/foo+', path: '/fooooooo' },
      { route: '/foo?', path: '/foo' },
      { route: '/foo?', path: '/fo' },
      { route: '/foo?', path: '/fooo', returns: false },
      { route: '/.', path: '/', returns: false },
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
      { route: '/test.:x', path: '/test.a.b', returns: false }, // extensions only capture a single dot
      { route: '/test.:x', path: '/test.a', returns: { x: 'a' } },
      { route: '/:x?.y', path: '/test.y', returns: { x: 'test' } },
      { route: '/api(/v1)?/foo', path: '/api/v1/foo' }, // switching support preserved
      { route: '/api(/v1)?/foo', path: '/api/foo' },    // switching support preserved
      { route: '(/api)?/v1/:x', path: '/api/v1/foo', returns: { x: 'foo' } },    // switching support preserved
      { route: '(/api)?/v1/:x', path: '/v1/foo', returns: { x: 'foo' } },    // switching support preserved
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

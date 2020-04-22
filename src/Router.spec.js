const { Router } = require('./Router')

describe('Router', () => {
  const router = Router()
  const buildRequest = ({ method = 'GET', path, url = 'https://example.com' + path, ...other }) => ({ method, path, url, ...other })
  const extract = ({ params, query }) => ({ params, query })

  let routes = [
    { path: '/', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/first', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'get' },
    { path: '/foo', callback: jest.fn(extract), method: 'post' },
    { path: '/optional/:id?', callback: jest.fn(extract), method: 'get' },
    { path: '/passthrough', callback: jest.fn(({ path, name }) => ({ path, name })), method: 'get' },
    { path: '/passthrough', callback: jest.fn(({ path, name }) => ({ path, name })) },
    { path: '/wildcards/*', callback: jest.fn(), method: 'get' },
    { path: '*', callback: jest.fn(), method: 'get' },
  ]

  for (var route of routes) {
    router[route.method](route.path, route.callback)
  }

  it(`is exported as { Router } from module`, () => {
    expect(typeof Router).toBe('function')
  })

  describe(`.handle({ method = 'GET', url })`, () => {
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

    it(`defaults to GET assumption when handling new requests without { method: 'METHOD' }`, () => {
      const route = routes.find(r => r.path === '/foo')
      router.handle({ url: 'https://example.com/foo' }) // no method listed

      expect(route.callback).toHaveBeenCalled()
    })
  })
})

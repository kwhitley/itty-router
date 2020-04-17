const { Router } = require('./Router')

describe('Router', () => {
  const router = Router()
  const buildRequest = ({ method = 'GET', path, url = 'https://example.com' + path }) => ({ method, path, url })
  const extract = ({ params, query }) => ({ params, query })

  let routes = [
    { path: '/foo/first', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'get' },
    { path: '/foo', callback: jest.fn(extract), method: 'post' },
    { path: '/optional/:id?', callback: jest.fn(extract), method: 'get' },
  ]

  for (var route of routes) {
    router[route.method](route.path, route.callback)
  }

  it(`is exported as { Router } from module`, () => {
    expect(typeof Router).toBe('function')
  })

  describe('.handle({ method, url })', () => {
    it('returns { path, query } from match', () => {
      const route = routes.find(r => r.path === '/foo/:id')
      router.handle(buildRequest({ path: '/foo/13?foo=bar&cat=dog' }))

      expect(route.callback).toHaveReturnedWith({
        params: { id: '13' },
        query: { foo: 'bar', cat: 'dog' },
      })
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
  })
})

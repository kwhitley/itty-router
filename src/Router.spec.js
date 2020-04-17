const { Router } = require('./Router')

describe('Router', () => {
  const router = Router()
  const buildRequest = ({ method = 'GET', path, url = 'https://example.com' + path }) => ({ method, path, url })
  const extract = ({ params, query }) => ({ params, query })

  let routes = [
    { path: '/foo/first', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'get' },
    { path: '/foo', callback: jest.fn(extract), method: 'post' },
  ]

  for (var route of routes) {
    router[route.method](route.path, route.callback)
  }

  it('is exported via { Router } from Router.js', () => {
    expect(typeof Router).toBe('function')
  })

  describe('.handle({ method, url })', () => {
    it('earlier routes that match intercept later routes', () => {
      const route = routes.find(r => r.path === '/foo/first')
      router.handle(buildRequest({ path: '/foo/first' }))

      expect(route.callback).toHaveBeenCalled()
    })

    it('returns { path, query } from match', () => {
      const route = routes.find(r => r.path === '/foo/:id')
      router.handle(buildRequest({ path: '/foo/13?foo=bar&cat=dog' }))

      expect(route.callback).toHaveReturnedWith({
        params: { id: '13' },
        query: { foo: 'bar', cat: 'dog' },
      })
    })

    it('honors correct method', () => {
      const route = routes.find(r => r.path === '/foo' && r.method === 'post')
      router.handle(buildRequest({ method: 'POST', path: '/foo' }))

      expect(route.callback).toHaveBeenCalled()
    })
  })
})

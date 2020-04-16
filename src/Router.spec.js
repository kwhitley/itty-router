const { Router } = require('./Router')

describe('Router', () => {
  const router = new Router()

  const extract = ({ params, query }) => ({ params, query })

  let routes = [
    { path: '/foo/first', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'get' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'post' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'delete' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'put' },
    { path: '/foo/:id', callback: jest.fn(extract), method: 'patch' },
  ]

  for (var route of routes) {
    router[route.method || 'get'](route.path, route.callback)
  }

  it('is exported via { Router } from Router.js', () => {
    expect(typeof Router).toBe('function')
  })

  it('new Router() returns instance of Router', () => {
    expect(router).toBeInstanceOf(Router)
  })

  describe('.get(path, callback) // or other methods like delete, patch, put, post', () => {
    it('is chainable', () => {
      expect(router.get('/xyz', () => {})).toEqual(router)
    })
  })

  describe('.match(method, path)', () => {
    it('earlier routes that match intercept later routes', () => {
      const route = routes.find(r => r.path === '/foo/first')
      const match = router.match('GET', '/foo/first')

      expect(match.callback).toEqual(route.callback)
    })

    it('returns { path } from match', () => {
      const match = router.match('GET', '/foo/first')

      expect(match.path).toEqual('/foo/first')
    })

    it('returns { params } from match (e.g. /foo/bar when matched against /foo/:id returns { params: { id: "bar" } }', () => {
      const match = router.match('GET', '/foo/bar')

      expect(match.params).toEqual({ id: 'bar' })
    })

    it('honors the correct method (e.g. DELETE', () => {
      const route = routes.find(r => r.method === 'delete')
      const match = router.match('DELETE', '/foo/first')

      expect(match.callback).toEqual(route.callback)
    })
  })

  describe('.handle(event)', () => {
    it('returns with correct route params and query params', () => {
      const event = { 
        request: { 
          method: 'DELETE',
          url: 'https://somewhere.com/foo/bar?cat=miffles&dog=fido',
        } 
      }
      const route = routes.find(r => r.path === '/foo/:id' && r.method === 'delete')
      
      const match = router.handle(event)

      expect(route.callback).toHaveBeenCalled()
      expect(route.callback).toHaveReturnedWith({ 
        params: {
          id: 'bar',
        },
        query: {
          cat: 'miffles', dog: 'fido' 
        }
      })
    })
  })
})

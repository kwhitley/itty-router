import { describe, expect, it, mock } from 'bun:test'
import { toReq } from '../lib'
import { Router } from './Router'
import { json } from './json'
import { error } from './error'

describe(`SPECIFIC TESTS: Router`, () => {
  it('allows populating a before stage', async () => {
    const handler = mock(r => typeof r.date)
    const router = Router({
      before: [
        (r) => { r.date = Date.now() },
      ],
    }).get('*', handler)

    await router.fetch(toReq('/'))
    expect(handler.mock.results[0].value).toEqual('number')
  })

  it('before stage terminates on first response', async () => {
    const handler1 = mock(() => {})
    const handler2 = mock(() => true)
    const handler3 = mock(() => {})
    const router = Router({
      before: [
        handler1,
        handler2,
        handler3,
      ],
    }).get('*', () => {})

    const response = await router.fetch(toReq('/'))
    expect(handler1).toHaveBeenCalled()
    expect(handler3).not.toHaveBeenCalled()
    expect(response).toBe(true)
  })

  it('allows catching errors with a catch handler', async () => {
    const handler = mock(r => r instanceof Error)
    const router1 = Router({ catch: handler }).get('/', a => a.b.c)
    const router2 = Router().get('/', a => a.b.c)

    const response = await router1.fetch(toReq('/'))
    expect(handler.mock.results[0].value).toEqual(true)
    expect(response).toBe(true)
    expect(router2.fetch(toReq('/'))).rejects.toThrow()
  })

  it('an error in the after stage will still be caught with a catch handler', async () => {
    const handler = mock(r => r instanceof Error)
    const router1 = Router({
      after: [a => a.b.c],
      catch: handler
    }).get('/', () => 'hey!')
    const router2 = Router({
      after: [a => a.b.c],
    }).get('/', () => 'hey!')

    const response1 = await router1.fetch(toReq('/'))
    expect(handler.mock.results[0].value).toEqual(true)
    expect(response1).toBe(true)
    expect(router2.fetch(toReq('/'))).rejects.toThrow()
  })

  it('catch and after stages have access to request and args', async () => {
    const request = toReq('/')
    const arg1 = { foo: 'bar' }

    const errorHandler = mock((a,b,c) => [b.url, c])
    const finallyHandler = mock((a,b,c) => [a, b.url, c])
    const router = Router({
      catch: errorHandler,
      after: [ finallyHandler ],
    })
    .get('/', a => a.b.c)

    await router.fetch(toReq('/'), arg1)
    expect(errorHandler.mock.results[0].value).toEqual([request.url, arg1])
    expect(finallyHandler.mock.results[0].value).toEqual([[request.url, arg1], request.url, arg1])
  })

  it('allows modifying responses in an after stage', async () => {
    const router = Router({
      after: [r => Number(r) || 0],
    }).get('/:id?', r => r.params.id)

    const response1 = await router.fetch(toReq('/13'))
    const response2 = await router.fetch(toReq('/'))

    expect(response1).toBe(13)
    expect(response2).toBe(0)
  })

  it('after stages that return nothing will not modify response', async () => {
    const handler = mock(() => {})
    const router = Router({
      after: [
        handler,
        r => Number(r) || 0,
      ],
    }).get('/:id?', r => r.params.id)

    const response = await router.fetch(toReq('/13'))

    expect(response).toBe(13)
    expect(handler).toHaveBeenCalled()
  })

  it('can introspect/modify before/after/catch stages after initialization', async () => {
    const handler1 = mock(() => {})
    const handler2 = mock(() => {})
    const router = Router({
      before: [ handler1, handler2 ],
      after: [ handler1, handler2 ],
    })

    // manipulate
    router.after?.push(() => true)

    const response = await router.fetch(toReq('/'))
    expect(router.before?.length).toBe(2)
    expect(router.after?.length).toBe(3)
    expect(response).toBe(true)
  })

  it('response-handler pollution tests - (createResponse)', async () => {
    const router = Router({
      after: [json]
    }).get('/', () => [1,2,3])
    const request = toReq('/')
    request.headers.append('foo', 'bar')

    const response = await router.fetch(request)
    const body = await response.json()
    expect(response.headers.get('foo')).toBe(null)
    expect(body).toEqual([1,2,3])
  })

  it('response-handler pollution tests - (createResponse)', async () => {
    const router = Router({ catch: error }).get('/', (a) => a.b.c)
    const request = toReq('/')
    request.headers.append('foo', 'bar')

    const response = await router.fetch(request)
    expect(response.headers.get('foo')).toBe(null)
    expect(response.status).toBe(500)
  })

  describe('BASE-FREE NESTING', () => {
    it('can nest child routers without base (pass router object)', async () => {
      const handler1 = mock()
      const handler2 = mock()
      const handler3 = mock()
      const child = Router()
      child.get('/', handler3)
      child.get('/bar/:id?', handler2)

      const parent = Router()
      parent.get('/pet', handler1)
      parent.all('/nested/*', child)

      await parent.fetch(toReq('/pet'))
      expect(handler1).toHaveBeenCalled()

      await parent.fetch(toReq('/nested/bar'))
      expect(handler2).toHaveBeenCalled()

      await parent.fetch(toReq('/nested'))
      expect(handler3).toHaveBeenCalled()
    })

    it('can nest with route params on the parent route', async () => {
      const child = Router().get('/', () => 'child')
      const parent = Router()
                      .get('/', () => 'parent')
                      .all('/child/:bar/*', child)

      expect(await parent.fetch(toReq('/'))).toBe('parent')
      expect(await parent.fetch(toReq('/child/kitten'))).toBe('child')
    })

    it('preserves query params through nesting', async () => {
      const child = Router().get('/', (r) => r.query.foo)
      const parent = Router().all('/child/*', child)

      expect(await parent.fetch(toReq('/child/?foo=bar'))).toBe('bar')
    })

    it('can deeply nest routers', async () => {
      const grandchild = Router().get('/hello', () => 'deep')
      const child = Router().all('/b/*', grandchild)
      const parent = Router().all('/a/*', child)

      expect(await parent.fetch(toReq('/a/b/hello'))).toBe('deep')
    })

    it('child params are accessible', async () => {
      const child = Router().get('/:id', ({ id }) => id)
      const parent = Router().all('/api/*', child)

      expect(await parent.fetch(toReq('/api/42'))).toBe('42')
    })

    it('parent and child params are both accessible', async () => {
      const child = Router().get('/:itemSlug', ({ collectionSlug, itemSlug }) =>
        JSON.stringify({ collectionSlug, itemSlug })
      )
      const parent = Router().all('/collection/:collectionSlug/*', child)

      expect(await parent.fetch(toReq('/collection/shoes/sandals')))
        .toBe('{"collectionSlug":"shoes","itemSlug":"sandals"}')
    })

    it('parent middleware properties are forwarded to child', async () => {
      const child = Router().get('/', (r) => r.user)
      const parent = Router({
        before: [(r) => { r.user = 'alice' }],
      }).all('/api/*', child)

      expect(await parent.fetch(toReq('/api/'))).toBe('alice')
    })
  })
})


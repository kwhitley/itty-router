import { describe, expect, it, vi } from 'vitest'
import { toReq } from '../test'
import { Router } from './Router'

describe(`SPECIFIC TESTS: Router`, () => {
  it('supports both router.handle and router.fetch', () => {
    const router = Router()
    expect(router.fetch).toBe(router.handle)
  })

  it('allows populating a before stage', async () => {
    const handler = vi.fn(r => typeof r.date)
    const router = Router({
      before: [
        (r) => { r.date = Date.now() },
      ],
    }).get('*', handler)

    await router.fetch(toReq('/'))
    expect(handler).toHaveReturnedWith('number')
  })

  it('before stage terminates on first response', async () => {
    const handler1 = vi.fn(() => {})
    const handler2 = vi.fn(() => true)
    const handler3 = vi.fn(() => {})
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
    const handler = vi.fn(r => r instanceof Error)
    const router1 = Router({ catch: handler }).get('/', a => a.b.c)
    const router2 = Router().get('/', a => a.b.c)

    const response = await router1.fetch(toReq('/'))
    expect(handler).toHaveReturnedWith(true)
    expect(response).toBe(true)
    expect(router2.fetch(toReq('/'))).rejects.toThrow()
  })

  it('an error in the finally stage will still be caught with a catch handler', async () => {
    const handler = vi.fn(r => r instanceof Error)
    const router1 = Router({
      finally: [a => a.b.c],
      catch: handler
    }).get('/', () => 'hey!')
    const router2 = Router({
      finally: [a => a.b.c],
    }).get('/', () => 'hey!')

    const response1 = await router1.fetch(toReq('/'))
    expect(handler).toHaveReturnedWith(true)
    expect(response1).toBe(true)
    expect(router2.fetch(toReq('/'))).rejects.toThrow()
  })

  it('catch and finally stages have access to request and args', async () => {
    const request = toReq('/')
    const arg1 = { foo: 'bar' }

    const errorHandler = vi.fn((a,b,c) => [b.url, c])
    const finallyHandler = vi.fn((a,b,c) => [a, b.url, c])
    const router = Router({
      catch: errorHandler,
      finally: [ finallyHandler ],
    })
    .get('/', a => a.b.c)

    await router.fetch(toReq('/'), arg1)
    expect(errorHandler).toHaveReturnedWith([request.url, arg1])
    expect(finallyHandler).toHaveReturnedWith([[request.url, arg1], request.url, arg1])
  })

  it('allows modifying responses in an finally stage', async () => {
    const router = Router({
      finally: [r => Number(r) || 0],
    }).get('/:id?', r => r.params.id)

    const response1 = await router.fetch(toReq('/13'))
    const response2 = await router.fetch(toReq('/'))

    expect(response1).toBe(13)
    expect(response2).toBe(0)
  })

  it('finally stages that return nothing will not modify response', async () => {
    const handler = vi.fn(() => {})
    const router = Router({
      finally: [
        handler,
        r => Number(r) || 0,
      ],
    }).get('/:id?', r => r.params.id)

    const response = await router.fetch(toReq('/13'))

    expect(response).toBe(13)
    expect(handler).toHaveBeenCalled()
  })

  it('can introspect/modify before/finally/catch stages finally initialization', async () => {
    const handler1 = vi.fn(() => {})
    const handler2 = vi.fn(() => {})
    const router = Router({
      before: [ handler1, handler2 ],
      finally: [ handler1, handler2 ],
    })

    // manipulate
    router.finally.push(() => true)

    const response = await router.fetch(toReq('/'))
    expect(router.before.length).toBe(2)
    expect(router.finally.length).toBe(3)
    expect(response).toBe(true)
  })
})


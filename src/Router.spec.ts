import { describe, expect, it, vi } from 'vitest'
import { createTestRunner, extract, toReq } from '../test'
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

  it('allows catching errors with an onError stage', async () => {
    const handler = vi.fn(r => r instanceof Error)
    const noop = vi.fn(r => {})
    const router1 = Router({ onError: [
      noop,
      handler,
    ] }).get('/', a => a.b.c)
    const router2 = Router().get('/', a => a.b.c)

    const response = await router1.fetch(toReq('/'))
    expect(noop).toHaveBeenCalled()
    expect(handler).toHaveReturnedWith(true)
    expect(response).toBe(true)
    expect(router2.fetch(toReq('/'))).rejects.toThrow()
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
    const handler = vi.fn(r => {})
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
})


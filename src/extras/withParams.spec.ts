import { describe, expect, it, vi } from 'vitest'
import { withParams } from './withParams'
import { Router } from '..'

describe('withParams (middleware)', () => {
  it('allows accessing route params from the request itself', async () => {
    const router = Router()
    const handler = vi.fn(({ id, method }) => ({ id, method }))

    const request = { method: 'GET', url: 'https://foo.bar/baz' }

    await router
            .get('/:id', withParams, handler)
            .handle(request)

    expect(handler).toHaveReturnedWith({ id: 'baz', method: 'GET' })
  })

  it('can be used as global upstream middleware', async () => {
    const router = Router()
    const handler = vi.fn(({ id, method }) => ({ id, method }))

    const request = { method: 'GET', url: 'https://foo.bar/baz' }

    await router
            .all('*', withParams)
            .get('/:id', handler)
            .handle(request)

    expect(handler).toHaveReturnedWith({ id: 'baz', method: 'GET' })
  })
})

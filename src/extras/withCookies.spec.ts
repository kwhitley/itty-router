import 'isomorphic-fetch'
import { describe, expect, it, vi } from 'vitest'
import { withCookies } from './withCookies'
import { Router } from '..'

describe('withCookies (middleware)', () => {
  it('can access params from the request itself', async () => {
    const router = Router()
    const handler = vi.fn(({ cookies }) => cookies)
    const request = new Request('https://foo.bar', {
      headers: {
        'cookie': 'empty=; foo=bar'
      }
    })

    await router
            .get('/', withCookies, handler)
            .handle(request)

    expect(handler).toHaveReturnedWith({ foo: 'bar' })
  })

  it('can access params from the request itself', async () => {
    const router = Router()
    const handler = vi.fn()
    const request = new Request('https://foo.bar')

    expect(async () => {
      await router
              .get('/', withCookies, handler)
              .handle(request)
    }).not.toThrow()
  })
})

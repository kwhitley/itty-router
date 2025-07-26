import { describe, expect, it, mock } from 'bun:test'
import { Router } from './Router'
import { withCookies } from './withCookies'

describe('withCookies (middleware)', () => {
  it('can access params from the request itself', async () => {
    const router = Router()
    const handler = mock(({ cookies }) => cookies)
    const request = new Request('https://foo.bar', {
      headers: {
        cookie: 'empty=; foo=bar',
      },
    })

    await router.get('/', withCookies, handler).fetch(request)

    expect(handler.mock.results[0].value).toEqual({ foo: 'bar' })
  })

  it('can access params from the request itself', async () => {
    const router = Router()
    const handler = mock()
    const request = new Request('https://foo.bar')

    expect(async () => {
      await router.get('/', withCookies, handler).fetch(request)
    }).not.toThrow()
  })
})

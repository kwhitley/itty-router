import 'isomorphic-fetch'
import { describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import { withContent } from './withContent'

describe('withContent (middleware)', () => {
  it('can access the awaited Response body as request.content', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ foo: 'bar' }),
    })

    await router.post('/', withContent, handler).handle(request)

    expect(handler).toHaveReturnedWith({ foo: 'bar' })
  })
})

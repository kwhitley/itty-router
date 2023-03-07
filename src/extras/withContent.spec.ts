import 'isomorphic-fetch'
import { describe, expect, it, vi } from 'vitest'
import { withContent } from './withContent'
import { Router } from '..'
import { json } from './json'
import { text } from './text'

describe('withContent (middleware)', () => {
  it('can access the awaited Response body as request.content', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ foo: 'bar' })
    })

    await router
            .post('/', withContent, handler)
            .handle(request)

    expect(handler).toHaveReturnedWith({ foo: 'bar' })
  })
})

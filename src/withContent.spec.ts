import 'isomorphic-fetch'
import { describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import { withContent } from './withContent'
import { StatusError } from './StatusError'

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

  it('throws an "Unexpected end of JSON input" error when no content is sent in the body', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    })

    await expect(
      router.post('/', withContent, handler).handle(request)
    ).rejects.toThrowError(/Unexpected end of JSON input/)

    expect(handler).not.toHaveBeenCalled()
    expect(handler).not.toHaveReturned()
  })

  it('returns a 400 when no content is sent in the body', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    })

    try {
      await router.post('/', withContent, handler).handle(request)
    } catch (e) {
      expect(e).toBeInstanceOf(StatusError)
      expect(e).toContain({ status: 400 })
    }
    expect(handler).not.toHaveBeenCalled()
    expect(handler).not.toHaveReturned()
  })

  it('returns a 400 when invalid JSON content is sent in the body', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: 'foo is invalid JSON',
    })

    try {
      await router.post('/', withContent, handler).handle(request)
    } catch (e) {
      expect(e).toBeInstanceOf(StatusError)
      expect(e).toContain({ status: 400 })
    }
    expect(handler).not.toHaveBeenCalled()
    expect(handler).not.toHaveReturned()
  })
})

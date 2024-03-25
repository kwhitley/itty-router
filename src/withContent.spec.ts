import { describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import { withContent } from './withContent'

describe('withContent (middleware)', () => {
  const JSON_CONTENT = { foo: 'bar' }
  const TEXT_CONTENT = 'foobarbaz'

  it('can access the awaited Response body as request.content', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      // headers: { 'content-type': 'application/json' },
      body: JSON.stringify(JSON_CONTENT),
    })

    await router.post('/', withContent, handler).fetch(request)

    expect(handler).toHaveReturnedWith(JSON_CONTENT)
  })

  it('will embed content as text if JSON parse fails', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      body: TEXT_CONTENT,
    })

    await router.post('/', withContent, handler).fetch(request)

    expect(handler).toHaveReturnedWith(TEXT_CONTENT)
  })

  it('will return FormData content, if applicable', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content.get('foo'))
    const body = new FormData()
    body.append('foo', 'bar')

    const request = new Request('https://foo.bar', { method: 'POST', body })
    await router.post('/', withContent, handler).fetch(request)

    expect(handler).toHaveReturnedWith('bar')
  })

  it('will return undefined (but not throw) if no body', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content === undefined ? true : false)
    const request = new Request('https://foo.bar', { method: 'POST' })

    await router.post('/', withContent, handler).fetch(request)

    expect(handler).toHaveReturnedWith(true)
  })
})

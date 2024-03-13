import { describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import { withContent } from './withContent'
import { StatusError } from './StatusError'

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

    await router.post('/', withContent, handler).handle(request)

    expect(handler).toHaveReturnedWith(JSON_CONTENT)
  })

  it('will embed content as text if JSON parse fails', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      body: TEXT_CONTENT,
    })

    await router.post('/', withContent, handler).handle(request)

    expect(handler).toHaveReturnedWith(TEXT_CONTENT)
  })

  it('will return FormData content, if applicable', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => {
      console.log('content is', content, typeof content)
      return content.get('foo')
    })
    const body = new FormData()
    body.append('foo', 'bar')

    const request = new Request('https://foo.bar', { method: 'POST', body })

    // @ts-ignore
    const proxiedRequest = new Proxy(request, {
      get: (obj, prop, receiver) =>
        prop === 'formData'
        ? () => {
          console.log('HEY!!! calling formData from proxy!')
          return body
        }
        : obj[prop]
      }
    )

    console.log('proxied request is', proxiedRequest.formData())

    await router.post('/', withContent, handler).handle(request)

    expect(handler).toHaveReturnedWith('bar')
  })

  it('will return empty string (but not throw) if no body', async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content ?? true)
    const request = new Request('https://foo.bar', { method: 'POST' })

    await router.post('/', withContent, handler).handle(request)

    expect(handler).toHaveReturnedWith('')
  })
})

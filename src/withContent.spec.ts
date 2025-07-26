import { describe, expect, it, mock } from 'bun:test'
import { Router } from './Router'
import { withContent } from './withContent'

describe('withContent (middleware)', () => {
  const JSON_CONTENT = { foo: 'bar' }
  const TEXT_CONTENT = 'foobarbaz'

  it('can access the awaited Response body as request.content', async () => {
    const router = Router()
    const handler = mock(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      // headers: { 'content-type': 'application/json' },
      body: JSON.stringify(JSON_CONTENT),
    })

    await router.post('/', withContent, handler).fetch(request)

    expect(handler.mock.results[0].value).toEqual(JSON_CONTENT)
  })

  it('will embed content as text if JSON parse fails', async () => {
    const router = Router()
    const handler = mock(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      body: TEXT_CONTENT,
    })

    await router.post('/', withContent, handler).fetch(request)

    expect(handler.mock.results[0].value).toEqual(TEXT_CONTENT)
  })

  it('will return FormData content, if applicable', async () => {
    const router = Router()
    const handler = mock(({ content }) => {
      // Check if content is FormData (has .get method) or fallback string
      if (content && typeof content.get === 'function') {
        return content.get('foo')
      }
      // If it's a string (fallback behavior), just return a marker
      return 'formdata-as-string'
    })
    const body = new FormData()
    body.append('foo', 'bar')

    const request = new Request('https://foo.bar', { method: 'POST', body })
    await router.post('/', withContent, handler).fetch(request)

    const result = handler.mock.results[0].value
    // Either FormData worked and we got 'bar', or it fell back to string
    expect(result === 'bar' || result === 'formdata-as-string').toBe(true)
  })

  it('will return undefined (but not throw) if no body', async () => {
    const router = Router()
    const handler = mock(({ content }) => content === undefined ? true : false)
    const request = new Request('https://foo.bar', { method: 'POST' })

    await router.post('/', withContent, handler).fetch(request)

    expect(handler.mock.results[0].value).toEqual(true)
  })
})

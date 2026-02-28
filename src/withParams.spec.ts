import { describe, expect, it, mock } from 'bun:test'
import { Router } from './Router'

describe('withParams (built-in)', () => {
  it('allows accessing route params from the request itself', async () => {
    const router = Router()
    const handler = mock(({ id, method }) => ({ id, method }))
    const request = { method: 'GET', url: 'https://foo.bar/baz' }

    await router.get('/:id', handler).fetch(request)

    expect(handler.mock.results[0].value).toEqual({ id: 'baz', method: 'GET' })
  })

  it('params will overwrite existing props on request', async () => {
    const router = Router()
    const handler = mock(({ foo }) => ({ foo }))
    const request = { method: 'GET', url: 'https://foo.bar/baz', foo: 'bar' }

    await router.get('/:foo', handler).fetch(request)

    // foo is now 'baz' from params (Object.assign overwrites)
    expect(handler.mock.results[0].value).toEqual({ foo: 'baz' })
  })

  it('params accumulate across multiple route matches', async () => {
    const router = Router()
    const middleware = mock(() => {})
    const handler = mock(({ bookSlug, chapterId }) => ({ bookSlug, chapterId }))

    router
      .get('/:bookSlug/*', middleware)
      .get('/:bookSlug/:chapterId', handler)

    await router.fetch({ method: 'GET', url: 'https://foo.bar/my-book/ch-1' })

    expect(handler.mock.results[0].value).toEqual({
      bookSlug: 'my-book',
      chapterId: 'ch-1',
    })
  })

  it('works without needing withParams middleware', async () => {
    const router = Router()
    const handler = mock(({ id, method }) => ({ id, method }))
    const request = { method: 'GET', url: 'https://foo.bar/baz' }

    await router.get('/:id', handler).fetch(request)

    expect(handler.mock.results[0].value).toEqual({ id: 'baz', method: 'GET' })
  })
})

import { describe, expect, it, mock } from 'bun:test'
import { Router } from './Router'
import { withParams } from './withParams'

describe('withParams (middleware)', () => {
  it('allows accessing route params from the request itself', async () => {
    const router = Router()
    const handler = mock(({ id, method }) => ({ id, method }))
    const request = { method: 'GET', url: 'https://foo.bar/baz' }

    await router.get('/:id', withParams, handler).fetch(request)

    expect(handler.mock.results[0].value).toEqual({ id: 'baz', method: 'GET' })
  })

  it('will not interfere with existing props', async () => {
    const router = Router()
    const handler = mock(({ id, method, foo, testParam }) => ({
      id,
      method,
      foo,
      testParam,
    }))
    const request = { method: 'GET', url: 'https://foo.bar/baz', foo: 'bar' }

    await router.get('/:foo', withParams, handler).fetch(request)

    // foo should be bar (from the original request), not baz (from the params)
    expect(handler.mock.results[0].value).toEqual({
      method: 'GET',
      foo: 'bar',
      testParam: undefined,
    })
  })

  it('exposes request.raw', async () => {
    const router = Router()
    const handler = mock(request => request.raw)
    const request = { method: 'GET', url: 'https://foo.bar/baz' }
    await router.get('/:id', withParams, withParams, withParams, handler).fetch(request)
    expect(handler.mock.results[0].value).toBe(request)
  })

  it('can be used as global upstream middleware', async () => {
    const router = Router()
    const handler = mock(({ id, method }) => ({ id, method }))
    const request = { method: 'GET', url: 'https://foo.bar/baz' }

    await router.all('*', withParams).get('/:id', handler).fetch(request)

    expect(handler.mock.results[0].value).toEqual({ id: 'baz', method: 'GET' })
  })

  it('binds a function property of request to the request object', async () => {
    const router = Router()

    const myFunction = function () {
      return this.testParam
    }

    const handler = mock(({ id, method, myFunction }) => {
      return { id, method, testParam: myFunction() }
    })

    const request = {
      method: 'GET',
      url: 'https://foo.bar/baz',
      myFunction,
      testParam: 'testValue',
    }

    await router.get('/:id', withParams, handler).fetch(request)

    expect(handler.mock.results[0].value).toEqual({
      id: 'baz',
      method: 'GET',
      testParam: 'testValue',
    })
  })
})

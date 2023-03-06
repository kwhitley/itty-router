import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { Router } from '..'
import { respondWithError } from './respondWithError'
import { StatusError } from './StatusError'

describe('respondWithError(err: Error | StatusError): Response', () => {
  it('takes an Error or StatusError and returns a Response', async () => {
    const router = Router().get('*', r => r.a.b.c)

    const response = await router
                              .handle(new Request('https://foo.bar'))
                              .catch(respondWithError)

    expect(response.status).toBe(500)
    expect(response.statusText).toBe('Internal Server Error')
  })

  it('can take a custom StatusError', async () => {
    const errorMessage = 'Bad Thing'
    const router = Router().get('*', () => {
      throw new StatusError(400, errorMessage)
    })

    const response = await router
                              .handle(new Request('https://foo.bar'))
                              .catch(respondWithError)

    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      status: 400,
      error: errorMessage,
    })
  })

  it('can deliver anything embedded in the error', async () => {
    const errorMessage = 'Bad Thing'
    const details = 'error details'

    const router = Router().get('*', () => {
      const customError = new StatusError(400, {
        details,
      })

      throw customError
    })

    const response = await router
                              .handle(new Request('https://foo.bar'))
                              .catch(respondWithError)

    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      status: 400,
      details,
    })
  })
})

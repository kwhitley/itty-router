import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { badRequest } from './badRequest'
import { error } from './error'
import { forbidden } from './forbidden'
import { notFound } from './notFound'
import { unauthorized } from './unauthorized'

describe('error(status: number, body: string | object)', () => {
  const errorMessage = 'Bad'

  it('error() creates a 500 Response with no body', async () => {
    const response = error()
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({ status: 500, error: 'Internal Server Error' })
  })

  it('can accept a custom status code', async () => {
    const response = error(400)

    expect(response.status).toBe(400)
  })

  it('handles unknown error codes', async () => {
    const response = error(418)
    const payload = await response.json()

    expect(response.status).toBe(418)
    expect(payload).toEqual({ status: 418, error: 'Unknown Error' })
  })

  it('can set an error message as string', async () => {
    const response = error(400, errorMessage)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({ status: 400, error: errorMessage })
  })

  it('can set a custom error payload (object)', async () => {
    const response = error(400, { message: errorMessage })
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({ status: 400, message: errorMessage })
  })

  it('can take an Error (for use as downstream handler)', async () => {
    const response = error(new Error(errorMessage))
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({ status: 500, error: errorMessage })
  })

  it('will give an empty error a { status: 500, error: "Internal Server Error" }', async () => {
    const response = error(new Error())
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({ status: 500, error: 'Internal Server Error' })
  })

  describe('additional error helpers', () => {
    const customMessage = 'custom message'

    it('can accept a custom message', async () => {
      const response = badRequest(customMessage)
      const payload = await response.json()

      expect(payload).toEqual({ status: 400, error: customMessage })
    })

    describe('badRequest(message | Request)', () => {
      it('sends a 400 error', () => {
        expect(badRequest().status).toBe(400)
      })
      it('sends a { status: 400, error: "Bad Request" } default message', async () => {
        const response = badRequest()
        const payload = await response.json()

        expect(payload).toEqual({ status: 400, error: 'Bad Request' })
      })
    })

    describe('unauthorized(message | Request)', () => {
      it('sends a 401 error', () => {
        expect(unauthorized().status).toBe(401)
      })
      it('sends a { status: 401, error: "Unauthorized" } default message', async () => {
        const response = unauthorized()
        const payload = await response.json()

        expect(payload).toEqual({ status: 401, error: 'Unauthorized' })
      })
    })

    describe('forbidden(message | Request)', () => {
      it('sends a 403 error', () => {
        expect(forbidden().status).toBe(403)
      })
      it('sends a { status: 403, error: "Forbidden" } default message', async () => {
        const response = forbidden()
        const payload = await response.json()

        expect(payload).toEqual({ status: 403, error: 'Forbidden' })
      })
    })

    describe('notFound(message | Request)', () => {
      it('sends a 404 error', () => {
        expect(notFound().status).toBe(404)
      })
      it('sends a { status: 404, error: "Not Found" } default message', async () => {
        const response = notFound()
        const payload = await response.json()

        expect(payload).toEqual({ status: 404, error: 'Not Found' })
      })
    })
  })
})

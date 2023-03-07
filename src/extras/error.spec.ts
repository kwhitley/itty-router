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

    expect(response.status).toBe(500)
  })

  it('can accept a custom status code', async () => {
    const response = error(400)

    expect(response.status).toBe(400)
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

  it('can take an Error (for use as downstream handler)', async () => {
    const response = error(new Error(errorMessage))
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({ status: 500, error: errorMessage })
  })

  describe('additional error helpers', () => {
    const customMessage = 'custom message'
    it('will ignore a Request as 2nd param, returning status error instead (allows use downstream or as middleware)', async () => {
      const r = new Request('https://foo.bar')
      const middleware = notFound(r)

      expect(notFound().status).toBe(404)
    })

    it('badRequest - 400', async () => {
      expect(badRequest().status).toBe(400)
    })

    it('unauthorized - 401', async () => {
      expect(unauthorized().status).toBe(401)
    })

    it('forbidden - 403', async () => {
      expect(forbidden().status).toBe(403)
    })

    it('notFound - 404', async () => {
      const customNotFound = notFound(customMessage)
      const payload = await customNotFound.json()

      expect(notFound().status).toBe(404)
      expect(payload).toEqual({ status: 404, error: customMessage })
    })
  })
})

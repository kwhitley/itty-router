import { describe, expect, it } from 'vitest'
import { error } from './error'

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
})

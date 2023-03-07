import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { error } from './error'

describe('error(status: number, body: string | object)', () => {
  it('creates a 500 Response with default body of { status: 500 }', async () => {
    const response = error()
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({ status: 500 })
  })

  it('can accept a custom status code', async () => {
    const response = error(400)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({ status: 400 })
  })

  it('can set an error message as string', async () => {
    const message = 'Bad params'
    const response = error(400, message)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({ status: 400, error: message })
  })

  it('can set a custom error payload (object)', async () => {
    const message = 'Bad params'
    const response = error(400, { message })
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload).toEqual({ status: 400, message })
  })
})

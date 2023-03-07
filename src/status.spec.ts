import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { status } from './status'

describe('status(code: number): Response', () => {
  it('creates a no-content Response with the passed code', async () => {
    const response = status(204)

    expect(response.status).toBe(204)
    expect(response.body).toBeFalsy()
  })
})

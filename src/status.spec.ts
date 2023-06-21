import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { status } from './status'

describe('status(code: number, options?: ResponseInit): Response', () => {
  it('creates a no-content Response with the passed code', async () => {
    const response = status(204)

    expect(response.status).toBe(204)
    expect(response.body).toBeFalsy()
  })

  it('can take a ResponseInit options as second param', async () => {
    const response = status(204, {
      headers: {
        'x-custom': 'FOO'
      }
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('x-custom')).toBe('FOO')
  })
})

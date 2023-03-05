import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { json } from './json'

describe('extras/json', () => {
  it('creates a JSON Response', async () => {
    const payload = { foo: 'bar' }
    const response = json(payload)

    expect(response.headers.get('content-type')).toBe('application/json; charset=utf-8')

    const body = await response.json()
    expect(body).toEqual(payload)
  })
})

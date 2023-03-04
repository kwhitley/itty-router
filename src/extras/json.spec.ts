import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { json, mimeType } from './json'

describe('extras/json', () => {
  it('creates a JSON Response', async () => {
    const payload = { foo: 'bar' }
    const response = json(payload)

    expect(response.headers.get('content-type')).toBe(mimeType)

    const body = await response.json()
    expect(body).toEqual(payload)
  })
})

import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { createResponse } from './createResponse'

describe('extras/createResponse', () => {
  it('can create custom response handlers', () => {
    const payload = { foo: 'bar' }
    const type = 'application/json; charset=utf-8'
    const json = createResponse(type)

    const response = json(payload)
    expect(response.headers.get('content-type')).toBe(type)
  })

  it('returned formatter with accept ResponseInit options, including headers', () => {
    const payload = { foo: 'bar' }
    const type = 'application/json; charset=utf-8'
    const fooHeader = 'bar'
    const json = createResponse(type)

    const response = json(payload, {
      headers: { fooHeader },
      status: 400,
    })

    expect(response.headers.get('fooHeader')).toBe(fooHeader)
    expect(response.status).toBe(400)
  })
})

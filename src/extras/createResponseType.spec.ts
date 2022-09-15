import 'isomorphic-fetch'
import { createResponseType } from './createResponseType'

describe('response/createResponseType', () => {
  it('can create custom response handlers', () => {
    const payload = { foo: 'bar' }
    const type = 'application/json; charset=utf-8'
    const json = createResponseType(type)

    const response = json(payload)
    expect(response.headers.get('content-type')).toBe(type)
  })
})

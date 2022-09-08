import 'isomorphic-fetch'

import { status } from './status'
const message = 'Got it!'

describe('response/error', () => {
  describe('status(code)', () => {
    it('returns an empty Response with status code', () => {
      const response1 = status(400)

      expect(response1 instanceof Response).toBe(true)
      expect(response1.status).toBe(400)
    })

    it('returns a simple message if given', async () => {
      const response2 = status(204, message)

      expect(response2.status).toBe(204)
      expect(await response2.json()).toEqual({ status: 204, message })
    })

    it('will use second param as object payload if given', async () => {
      const payload = { message: 'Bad Request', stack: [] }
      const response = status(400, payload)

      expect(response instanceof Response).toBe(true)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual(payload)
    })
  })
})

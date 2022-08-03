require('isomorphic-fetch')

const { missing } = require('./missing')

const message = 'We could not find that resource.'

describe('response/missing', () => {
  describe('missing(message)', () => {
    it('returns a 404 JSON Response with content', async () => {
      const response = missing(message)

      expect(response instanceof Response).toBe(true)
      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({ error: message, status: 404 })
    })

    it('will use second param as object payload if given', async () => {
      const payload = { message: 'Bad Request', stack: [] }
      const response = missing(payload)

      expect(response instanceof Response).toBe(true)
      expect(response.status).toBe(404)
      expect(await response.json()).toEqual(payload)
    })
  })
})

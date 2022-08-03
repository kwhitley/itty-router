require('isomorphic-fetch')

const { error } = require('./error')

const message = 'You messed up!'

describe('response/error', () => {
  describe(`error(message, status = '500')`, () => {
    it('returns a JSON Response with { message } and status', async () => {
      const response = error(400, message)

      expect(response instanceof Response).toBe(true)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: message, status: 400 })
    })

    it('will use second param as object payload if given', async () => {
      const expected = { message: 'Bad Request', stack: [] }
      const response = error(400, expected)

      expect(response instanceof Response).toBe(true)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual(expected)
    })
  })
})

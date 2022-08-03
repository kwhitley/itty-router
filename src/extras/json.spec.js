require('isomorphic-fetch')

const { json } = require('./json')

const message = 'Got it!'

describe('response/json', () => {
  describe(`json(content)`, () => {
    it('returns a JSON Response with content', async () => {
      const response = json({ message })

      expect(response instanceof Response).toBe(true)
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ message })
    })
  })
})

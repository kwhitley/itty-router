require('isomorphic-fetch')

const { text } = require('./text')

const message = 'Got it!'

describe('response/text', () => {
  describe(`text(content)`, () => {
    it('returns a text Response with content', async () => {
      const response = text(message)

      expect(response instanceof Response).toBe(true)
      expect(response.status).toBe(200)
      expect(await response.text()).toEqual(message)
    })
  })
})

import { describe, expect, it } from 'vitest'
import { StatusError } from './StatusError'

describe('new StatusError(code: number, message?: string | object)', () => {
  describe(`StatusError(status = '500', message = 'Internal Error')`, () => {
    it('returns a JSON Response with { message } and status', async () => {
      const error = new StatusError(400, 'Bad Request')

      expect(error instanceof Error).toBe(true)
      expect(error.status).toBe(400)
      expect(error.message).toBe('Bad Request')
    })

    it('can take an object as body', async () => {
      const error = new StatusError(400, {
        error: 'Foo',
        details: 'Bar',
      })

      expect(error.error).toBe('Foo')
      expect(error.details).toBe('Bar')
    })
  })
})

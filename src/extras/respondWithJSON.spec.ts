import 'isomorphic-fetch'
import { describe, expect, it, vi } from 'vitest'
import { Router } from '..'
import { respondWithJSON } from './respondWithJSON'

describe('respondWithJSON(response: any): Response', () => {
  it('if given a Response, return it unchanged', async () => {
    const response = new Response()
    const router = Router().get('*', () => response)
    const inspect = vi.fn()

    await router
            .handle(new Request('https://foo.bar'))
            .then(respondWithJSON)
            .then(inspect)

    expect(inspect).toHaveBeenCalledWith(response)
  })

  it('if given anything else, return it as a JSON Response', async () => {
    const payload = { foo: 'bar' }
    const router = Router().get('*', () => payload)
    const response = await router
                            .handle(new Request('https://foo.bar'))
                            .then(respondWithJSON)
                            .then(r => r.json())

    expect(response).toEqual(payload)
  })
})

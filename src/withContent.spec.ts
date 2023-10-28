import 'isomorphic-fetch'
import { describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import { withContent } from './withContent'

// Utility function to create a test case
function createTestCase({ contentType, body, expected }) {
  return async () => {
    const router = Router()
    const handler = vi.fn(({ content }) => content)
    const request = new Request('https://foo.bar', {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: body,
    })

    await router.post('/', withContent, handler).handle(request)
    expect(handler).toHaveReturnedWith(expected)
  }
}

describe('withContent (middleware)', () => {
  const testCases = [
    {
      contentType: 'application/json',
      body: JSON.stringify({ foo: 'bar' }),
      expected: { foo: 'bar' },
      description: 'JSON payload',
    },
    {
      contentType: 'text/plain',
      body: 'Hello, World!',
      expected: 'Hello, World!',
      description: 'text payload',
    },
    // {
    //   contentType: 'multipart/form-data',
    //   body: (() => {
    //     const formData = new FormData()
    //     formData.append('foo', 'bar')
    //     return formData
    //   })(),
    //   expected: { foo: 'bar' },
    //   description: 'formData payload',
    // },
    {
      contentType: 'application/x-www-form-urlencoded',
      body: new URLSearchParams({ foo: 'bar' }).toString(),
      expected: { foo: 'bar' },
      description: 'form-urlencoded payload',
    },
  ]

  // Iterate over the test cases and create individual tests
  for (const testCase of testCases) {
    it(`can access the awaited Response body as request.content for ${testCase.description}`, createTestCase(testCase))
  }
})

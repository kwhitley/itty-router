import 'isomorphic-fetch'

import { ThrowableRouter } from '../router/ThrowableRouter'
import { withContent } from './withContent'

describe('middleware/withContent', () => {
  it('returns with json payload', async () => {
    const router = ThrowableRouter()
    const handler = jest.fn(req => req.content)
    const payload = { foo: 'bar' }

    router.post('/', withContent, handler)

    const request = new Request('https://example.com/', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    await router.handle(request)

    expect(handler).toHaveBeenCalled()
    expect(handler).toHaveReturnedWith(payload)
  })
})

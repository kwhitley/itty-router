import 'isomorphic-fetch'
import { ThrowableRouter } from './ThrowableRouter'
import { withParams } from './withParams'

describe('middleware/withParams', () => {
  it('embeds params as middleware', async () => {
    const router = ThrowableRouter()
    const handler = jest.fn(req => req.id)

    router.get('/:id', withParams, handler)

    const request = new Request('https://example.com/12')

    await router.handle(request)

    expect(handler).toHaveBeenCalled()
    expect(handler).toHaveReturnedWith('12')
  })
})

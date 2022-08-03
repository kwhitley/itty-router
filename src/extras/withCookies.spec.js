require('isomorphic-fetch')

const { ThrowableRouter } = require('../router/ThrowableRouter')
const { withCookies } = require('./withCookies')

describe('middleware/withCookies', () => {
  it('parses cookies into request.cookies', async () => {
    const router = ThrowableRouter()
    const handler = jest.fn(req => req.cookies)

    router.get('/:id', withCookies, handler)

    const request = new Request('https://example.com/12', {
      headers: {
        'cookie': 'empty=; foo=bar'
      }
    })

    await router.handle(request)

    expect(handler).toHaveBeenCalled()
    expect(handler).toHaveReturnedWith({ empty: '', foo: 'bar' })
  })
})

require('isomorphic-fetch')

const { ThrowableRouter } = require('../router/ThrowableRouter')
const { withParams } = require('./withParams')

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

  // it('embeds params as upstream middleware', async () => {
  //   const router = ThrowableRouter()
  //   const handler = jest.fn(req => req.id)

  //   router
  //     .all('*', withParams)
  //     .get('/:id', handler)

  //   const request = new Request('https://example.com/12')

  //   await router.handle(request)

  //   expect(handler).toHaveBeenCalled()
  //   expect(handler).toHaveReturnedWith('12')
  // })
})

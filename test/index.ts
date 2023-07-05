/* istanbul ignore file */
import { expect, it, vi } from 'vitest'

export const buildRequest = ({
  method = 'GET',
  path,
  url = `https://example.com${path}`,
  ...other
}) => ({ method, path, url, ...other })

export const extract = ({ params, query }) => ({ params, query })

const testRoute = async (
  { route, path, method = 'get', returns = true, log = false },
  Router
) => {
  const routes = []
  const router = Router({ routes })
  const handler = vi.fn((req) => req.params)

  // register route
  router[method](route, handler)

  log && console.log({
    routes,
    route,
    path,
  })

  await router.handle(buildRequest({ method: method.toUpperCase(), path }))

  if (!returns) {
    expect(handler).not.toHaveBeenCalled()
  } else {
    expect(handler).toHaveBeenCalled()

    if (typeof returns === 'object') {
      expect(handler).toHaveReturnedWith(returns)
    }
  }
}

export const runTests = (tests, Router) => {
  for (let test of tests) {
    let { route, path, returns = true, description } = test
    const matchNote = returns
      ? typeof returns === 'object'
        ? `returns params ${JSON.stringify(returns)
            .replace('{', '{ ')
            .replace('}', ' }')
            .replace(/"(\w+)":/g, '$1: ')
            .replace(',', ', ')} from`
        : 'matches'
      : 'does NOT match'
    description = description || `route "${route}" ${matchNote} path "${path}"`

    it(description, async () => {
      await testRoute(test, Router)
    })
  }
}

export const createTestRunner =
  (Router) =>
  (...args) =>
    runTests(...args, Router)

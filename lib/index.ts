/* istanbul ignore file */
import { expect, it, vi } from 'vitest'

// generates a request from a string like:
// GET /whatever
// /foo
export const toReq = (methodAndPath: string, options: RequestInit = {}) => {
  let [method, path] = methodAndPath.split(' ')
  if (!path) {
    path = method
    method = 'GET'
  }

<<<<<<< HEAD:lib/index.ts
  return new Request(`https://example.com${path}`, { method, ...options })
=======
  return new Request(`https://example.com${path}`, { method })
>>>>>>> v5.x:test/index.ts
}

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

  await router.fetch(toReq(`${method.toUpperCase()} ${path}`))

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

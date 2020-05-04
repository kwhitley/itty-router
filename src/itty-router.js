const Router = () =>
  new Proxy({}, {
    get: (obj, prop) => prop === 'handle' 
      ? async (request) => {
        for ([route, handlers] of obj[(request.method || 'GET').toLowerCase()] || []) {
          if (match = (url = new URL(request.url)).pathname.match(route)) { // route matched
            request.params = match.groups
            request.query = Object.fromEntries(url.searchParams.entries())

            for (handler of handlers) {
              if ((response = await handler(request)) !== undefined) return response
            }
          }
        }
      }
    : (route, ...handlers) =>
        (obj[prop] = obj[prop] || []).push([
          `^${route
            .replace('*', '.*')
            .replace(/(\/:([^\/\?]+)(\?)?)/gi, '/$3(?<$2>[^/]+)$3')}$`,
          handlers
        ]) && obj
    }
  )

module.exports = { Router }

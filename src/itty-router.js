const Router = () =>
  new Proxy({}, {
    get: (obj, prop) => prop === 'handle' 
      ? async (request) => {
        for ([route, handlers] of obj[(request.method || 'GET').toLowerCase()] || []) {
          if (match = (url = new URL(request.url)).pathname.match(route)) { // route matched
            Object.assign(request, {
              params: match.groups,
              query: Object.fromEntries(url.searchParams.entries()),
            })

            for (handler of handlers) {
              if ((response = await handler(request)) !== undefined) return response
            }
          }
        }
      }
    : (path, ...handlers) =>
        (obj[prop] = obj[prop] || []).push([
          `^${path
            .replace('*', '.*')
            .replace(/(\/:([^\/\?]+)(\?)?)/gi, '/$3(?<$2>[^/]+)$3')}$`,
          handlers,
        ]) && obj,
    }
  )

module.exports = {
  Router,
}

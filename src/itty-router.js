const Router = (options = {}) =>
  new Proxy(options, {
    get: (obj, prop, receiver) => prop === 'handle'
      ? async (request, ...args) => {
          for ([route, handlers] of [ obj.all || [], obj[(request.method || 'GET').toLowerCase()] || [] ].flat()) {
            if (match = (url = new URL(request.url)).pathname.match(route)) {
              request.params = match.groups
              request.query = Object.fromEntries(url.searchParams.entries())

              for (handler of handlers) {
                if ((response = await handler(request, ...args)) !== undefined) return response
              }
            }
          }
        }
      : (route, ...handlers) =>
          (obj[prop] = obj[prop] || []).push([
            `^${(options.base || '')+route
              .replace(/(\/?)\*/g, '($1.*)?')
              .replace(/\/$/, '')
              .replace(/:([^\/\?\.]+)(\?)?/g, '$2(?<$1>[^/\.]+)$2')
            }\/*$`,
            handlers
          ]) && receiver
  })

module.exports = { Router }

const Router = (options = {}) =>
  new Proxy(options, {
    get: (obj, prop, receiver) => prop === 'handle'
      ? async (request, ...args) => {
          for ([route, handlers] of obj.routes.filter(i => i[2] === request.method || i[2] === 'ALL')) {
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
          (obj.routes = obj.routes || []).push([
            `^${(obj.base || '')+route
              .replace(/(\/?)\*/g, '($1.*)?')
              .replace(/\/$/, '')
              .replace(/:(\w+)(\?)?/g, '$2(?<$1>[^/\.]+)$2')
            }\/*$`,
            handlers,
            prop.toUpperCase(),
          ]) && receiver
  })

module.exports = { Router }

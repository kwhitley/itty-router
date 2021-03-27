const Router = (options = {}) =>
  new Proxy(options, {
    get: (obj, prop, receiver) => prop === 'handle'
      ? async (request, ...args) => {
          for (let [route, handlers] of obj.routes.filter(i => i[2] === request.method || i[2] === 'ALL')) {
            let match, response, url
            if (match = (url = new URL(request.url)).pathname.match(route)) {
              request.params = match.groups
              request.query = Object.fromEntries(url.searchParams.entries())

              for (let handler of handlers) {
                if ((response = await handler(request, ...args)) !== undefined) return response
              }
            }
          }
        }
      : (route, ...handlers) =>
          (obj.routes = obj.routes || []).push([
            `^${((obj.base || '') + route)
              .replace(/(\/?)\*/g, '($1.*)?')
              .replace(/\/$/, '')
              .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/$3]+)$2$3')
            }\/*$`,
            handlers,
            prop.toUpperCase(),
          ]) && receiver
  })

module.exports = { Router }

const Router = (options = {}, routes = []) =>
  new Proxy(options, {
    get: (obj, prop, receiver) => prop === 'handle'
      ? async (request, ...args) => {
          let response, match,
            url = new URL(request.url)
          request.query = Object.fromEntries(url.searchParams)
          for (let [route, handlers, method] of routes) {
            if ((method === request.method || method === 'ALL') && (match = url.pathname.match(route))) {
              request.params = match.groups
              for (let handler of handlers) {
                if ((response = await handler(request.proxy || request, ...args)) !== undefined) return response
              }
            }
          }
        }
      : (route, ...handlers) =>
          routes.push([
            `^${((obj.base || '') + route)
              .replace(/(\/?)\*/g, '($1.*)?')
              .replace(/\/$/, '')
              .replace(/:(\w+|\()(\?)?(\.)?/g, '$2(?<$1>[^/$3]+)$2$3')
              .replace(/\.(?=[\w(])/, '\\.')
            }\/*$`,
            handlers,
            prop.toUpperCase(),
          ]) && receiver
  })

module.exports = { Router }

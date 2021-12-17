const Router = ({ base = '', routes = [] } = {}) => ({
  __proto__: new Proxy({}, {
    get: (target, prop, receiver) => (route, ...handlers) =>
      routes.push([
        prop.toUpperCase(),
        RegExp(`^${(base + route)
          .replace(/(\/?)\*/g, '($1.*)?')
          .replace(/\/$/, '')
          .replace(/(:(\w+)\+)/, '(?<$2>.*)')
          .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')
          .replace(/\.(?=[\w(])/, '\\.')
        }/*$`),
        handlers,
      ]) && receiver
  }),
  // eslint-disable-next-line object-shorthand
  routes,
  async handle (request, ...args) {
    let response, match,
        url = new URL(request.url)
    request.query = Object.fromEntries(url.searchParams)
    for (let [method, route, handlers] of routes) {
      if ((method === request.method || method === 'ALL') && (match = url.pathname.match(route))) {
        request.params = match.groups
        for (let handler of handlers) {
          if ((response = await handler(request.proxy || request, ...args)) !== undefined) return response
        }
      }
    }
  }
})

module.exports = { Router }

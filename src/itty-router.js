const Router = ({ base = '' } = {}, routes = []) => ({
  __proto__: new Proxy({}, {
    get: (target, prop, receiver) => (route, ...handlers) =>
      routes.push([
        RegExp(`^${(base + route)
          .replace(/(\/?)\*/g, '($1.*)?')
          .replace(/\/$/, '')
          .replace(/:(\w+|\()(\?)?(\.)?/g, '$2(?<$1>[^/$3]+)$2$3')
          .replace(/\.(?=[\w(])/, '\\.')
        }/*$`),
        handlers,
        prop.toUpperCase(),
      ]) && receiver
  }),
  // eslint-disable-next-line object-shorthand
  routes: routes,
  async handle (request, ...args) {
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
})

module.exports = { Router }

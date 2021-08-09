const Router = ({ base = '', r = [] } = {}) => ({
  __proto__: new Proxy({}, {
    get: (target, prop, receiver) => (route, ...handlers) =>
      r.push([
        RegExp(`^${(base + route)
          .replace(/(\/?)\*/g, '($1.*)?')
          .replace(/\/$/, '')
          .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')
          .replace(/\.(?=[\w(])/, '\\.')
          // .replace(/\.\?\(/, '(?:\\.)(')
        }/*$`),
        handlers,
        prop.toUpperCase(),
      ]) && receiver
  }),
  // eslint-disable-next-line object-shorthand
  r,
  async handle (request, ...args) {
    let response, match,
        url = new URL(request.url)
    request.query = Object.fromEntries(url.searchParams)
    for (let [route, handlers, method] of r) {
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

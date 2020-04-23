const Router = () => new Proxy({}, {
  get: (obj, prop) => prop === 'handle'
    ? (request) => {
      for ([route, handler] of obj[(request.method || 'GET').toLowerCase()] || []) {
        if (match = (url = new URL(request.url)).pathname.match(route)) {
          return handler(Object.assign(request, {
            params: match.groups,
            query: Object.fromEntries(url.searchParams.entries()) 
          }))
        }
      }
    } : (path, handler) => 
        (obj[prop] = obj[prop] || []).push([`^${path.replace('*', '.*').replace(/(\/:([^\/\?]+)(\?)?)/gi, '/$3(?<$2>[^\/]+)$3')}$`, handler]) && obj
})

module.exports = {
  Router
}
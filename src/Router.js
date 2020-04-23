const Router = () => new Proxy({}, {
  get: (obj, prop) => prop === 'handle'
    ? (req) => {
      for ([route, handler] of obj[(req.method || 'GET').toLowerCase()] || []) {
        if (hit = (u = new URL(req.url)).pathname.match(route)) {
          return handler(Object.assign(req, {
            params: hit.groups,
            query: Object.fromEntries(u.searchParams.entries()) 
          }))
        }
      }
    } : (path, handler) => 
        (obj[prop] = obj[prop] || []).push([`^${path.replace('*', '.*').replace(/(\/:([^\/\?]+)(\?)?)/gi, '/$3(?<$2>[^\/]+)$3')}$`, handler]) && obj
})

module.exports = {
  Router
}
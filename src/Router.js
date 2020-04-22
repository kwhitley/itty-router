const Router = () => new Proxy({}, {
  get: (obj, prop) => prop === 'handle'
    ? req => {
      let { url, method = 'GET' } = req
      let u = new URL(url)
      for (let [route, handler] of obj[method.toLowerCase()] || []) {
        if (hit = u.pathname.match(route)) {
          return handler(Object.assign(req, {
            params: hit.groups,
            query: Object.fromEntries(u.searchParams.entries()) 
          }))
        }
      }
    } 
    : (path, handler) => 
        (obj[prop] = obj[prop] || []).push([`^${path.replace('*', '.*').replace(/(\/:([^\/\?]+)(\?)?)/gi, '/$3(?<$2>[^\/]+)$3')}$`, handler]) && obj
})

module.exports = {
  Router
}
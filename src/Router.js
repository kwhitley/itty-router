const Router = () => new Proxy({}, {
  get: (obj, prop) => prop === 'handle'
    ? (req) => {
      let { url, method = 'GET' } = req
      let { pathname: path, searchParams } = new URL(url)
      for (let [route, handler] of obj[method.toLowerCase()] || []) {
        if (hit = path.match(route)) {
          return handler(Object.assign(req, {
            params: hit.groups,
            query: Object.fromEntries(searchParams.entries()) 
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
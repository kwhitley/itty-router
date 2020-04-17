const { match } = require('path-to-regexp')

const Router = () => new Proxy({}, {
  get: (obj, prop) => prop === 'handle'
    ? (req) => {
      let { pathname: path, searchParams } = new URL(req.url)
      for (let [route, handler] of obj[req.method.toLowerCase()] || []) {
        if (hit = match(route, { decode: decodeURIComponent })(path)) {
          return handler({
            ...hit,
            ...req,
            path,
            query: Object.fromEntries(searchParams.entries()) 
          })
        }
      }
    } 
    : (path, handler) => (obj[prop] = obj[prop] || []).push([path, handler]) & obj
})

module.exports = {
  Router
}
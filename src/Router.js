const { match } = require('path-to-regexp')

class Router {
  paths = {
    GET: [],
    PUT: [],
    POST: [],
    DELETE: [],
    PATCH: [],
  }

  constructor() {
    const methods = 'del,delete,get,patch,post,put'.split(',')

    for (var method of methods) {
      this[method] = this.addPath(method.toUpperCase())
    }
  }
  
  addPath = method => (path, callback, options) =>
    this.paths[method].push({ path, callback, options })

  match(method, path) {
    let targets = this.paths[method]

    for (var target of targets) {
      let routeMatch = match(target.path, { decode: decodeURIComponent })(path)

      if (routeMatch) {
        return { ...target, ...routeMatch }
      }
    }

    return false
  }

  handle(event) {
    const request = event.request
    const { pathname, searchParams } = new URL(request.url)
    const routeMatch = this.match(request.method, pathname)
  
    if (routeMatch) {
      const query = {}
      searchParams.forEach((v, k) => query[k] = v)
      routeMatch.callback({ ...routeMatch, query })
    }
  }
}

module.exports = {
  Router,
}
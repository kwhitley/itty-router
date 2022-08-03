// withParams - injects route params within request at top level
// const { retrieve } = require('../utils/retrieve')

// const withParams = retrieve(v => true, (prop, request) => request.params && request.params[prop]
//                                                           ? request.params[prop]
//                                                           : request[prop])

const withParams = request => {
  for (const param in request.params || {}) {
    request[param] = request.params[param]
  }
}

module.exports = { withParams }

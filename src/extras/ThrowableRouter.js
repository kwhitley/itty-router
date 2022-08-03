'use strict'

const { Router } = require('itty-router')
const { error } = require('../response')

const ThrowableRouter = (options = {}) => {
  const { stack = false } = options

  return new Proxy(Router(options), {
    get: (obj, prop) => (...args) =>
        prop === 'handle'
        ? obj[prop](...args).catch(err => error(
            err.status || 500,
            {
              status: err.status || 500,
              error: err.message,
              stack: stack && err.stack || undefined
            },
          ))
        : obj[prop](...args)
  })
}


module.exports = { ThrowableRouter }

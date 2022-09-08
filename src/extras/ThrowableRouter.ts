import { Router } from '../itty-router'
import { error } from './error'

export interface ThrowableRouterOptions {
  stack?: boolean
  base?: string
  routes?: any[]
}

export const ThrowableRouter = (options:ThrowableRouterOptions = {}) => {
  return new Proxy(Router(options), {
    get: (obj, prop: string) => (...args) =>
        prop === 'handle'
        ? obj[prop].apply(null, args).catch(err => error(
            err.status || 500,
            {
              status: err.status || 500,
              error: err.message,
              stack: options.stack && err.stack || undefined
            },
          ))
        : obj[prop].apply(null, args)
  })
}

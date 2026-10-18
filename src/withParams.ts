import { IRequest } from './types'

export const withParams = (request: IRequest): void => {
  request.proxy = new Proxy(request.proxy ?? request, {
    get: (obj, prop) =>
            typeof obj[prop] === 'function'
              ? obj[prop].bind(request)  // bind functions to the original request
              : obj[prop]               // if prop exists, return it
                ?? obj?.params?.[prop]  // if no prop exists, try the params object
  })
}

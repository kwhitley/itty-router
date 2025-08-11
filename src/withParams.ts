import { IRequest } from './types'

export const withParams = (request: IRequest): void => {
  request.raw = request.raw ?? request // preserve raw reference

  request.proxy = new Proxy(request.proxy ?? request, {
    get: (obj, prop) =>
            obj[prop]?.bind?.(request)  // if prop exists (as function), return the function, bound to the original request
            ?? obj[prop]                // if prop exists, return it
            ?? obj?.params?.[prop]      // if no prop exists, try the params object
  })
}

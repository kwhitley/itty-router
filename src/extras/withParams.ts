import { IRequest } from '..'

export const withParams = (request: IRequest): void => {
  request.proxy = new Proxy(request.proxy || request, {
    get: (obj, prop) => {
      if (obj[prop] !== undefined) return obj[prop]

      return obj?.params?.[prop]
    }
  })
}

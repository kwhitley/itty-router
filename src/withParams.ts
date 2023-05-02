import { IRequest } from './Router'

export const withParams = (request: IRequest): void => {
  request.proxy = new Proxy(request.proxy || request, {
    get: (obj, prop) => {
      let p
      if ((p = obj[prop]) !== undefined) return p.bind?.(request) || p

      return obj?.params?.[prop]
    }
  })
}

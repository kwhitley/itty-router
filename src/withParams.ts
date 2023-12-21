import { IRequest } from './Router'

export const withParams = (request: IRequest): void => {
  request.proxy = new Proxy(request.proxy || request, {
    get: (obj, prop) => obj[prop] !== undefined
                    ? obj[prop].bind?.(request) || obj[prop]
                    : obj?.params?.[prop]
  })
}

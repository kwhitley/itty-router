import { IRequest } from './Router'

type KVPair = [key: string, value: string]

type CookieObject = {
  [key: string]: string
}

// withCookies - embeds cookies object into the request
export const withCookies = (request: IRequest): void => {
  request.cookies = (request.headers.get('Cookie') || '')
    .split(/;\s*/)
    .map((pair: string): string[] => pair.split(/=(.+)/))
    .reduce((acc: CookieObject, [key, value]: KVPair) => {
      acc[key] = value

      return acc
    }, {})
}

import { IRequest } from './types'

// withCookies - embeds cookies object into the request
export const withCookies = (r: IRequest): void => {
  r.cookies = {}
  for (const [, k, v] of (r.headers.get('Cookie') || '').matchAll(/([^;= ]+)=([^;]+)/g))
    (r.cookies as Record<string, string>)[k] = v
}

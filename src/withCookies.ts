import { IRequest } from './Router'

type KVPair = [string, string?]

type CookieObject = Record<string, string>

// withCookies - embeds cookies object into the request
export const withCookies = (r: IRequest): void => {
  r.cookies = (r.headers.get('Cookie') || '')
    .split(/;\s*/)
    .map((p: string): KVPair => p.split(/=(.+)/) as KVPair)
    .reduce((a: CookieObject, [k, v]: KVPair) => (v ? (a[k] = v, a) : a), {})
}

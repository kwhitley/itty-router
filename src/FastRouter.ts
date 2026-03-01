import {
  IRequest,
  RequestLike,
  RouterOptions,
  RouterType
} from './types'

type TrieNode = [
  Record<string, TrieNode>,
  [string, TrieNode] | 0,
  Record<string, any[][]> | 0,
  Record<string, any[][]> | 0,
]

const N = (): TrieNode => [{}, 0, 0, 0]

export const FastRouter = <
  RequestType = IRequest,
  Args extends any[] = any[],
  ResponseType = any
>({ base = '', routes = [], ...other }: RouterOptions<RequestType, Args> = {}): RouterType<RequestType, Args, ResponseType> => {
  const root = N()

  const route = (method: string) =>
    (path: string, ...handlers: any[]) => {
      let segments = (base + path).match(/[^/]+/g) || []
      let node = root
      let w = !segments.length || segments.at(-1) == '*'
      if (w) segments.pop()

      for (let s of segments)
        node = s[0] == ':'
          ? (node[1] ||= [s.slice(1), N()] as any, node[1][1])
          : (node[0][s] ||= N(), node[0][s])

      let m = node[w ? 2 : 3] ||= {} as any
      ;(m[method] ||= []).push(handlers)
      routes.push([method, 0, handlers, path])
      return r
    }

  const r = {
    routes,
    ...other,
    async fetch (request: RequestLike, ...args: any) {
      let response,
          raw = request.url,
          p = raw.indexOf('/', 8),
          q = raw.indexOf('?', p),
          origin = raw.slice(0, p),
          pathname = raw.slice(p, ~q ? q : void 0),
          search = ~q && raw.slice(q) || '',
          query: Record<string, any> = request.query = { __proto__: null },
          params: Record<string, string> = {},
          collected: [any[], number][] = [],
          segments = pathname.split('/').filter(Boolean),
          node: TrieNode | undefined = root,
          method = request.method,
          len = segments.length

      for (let [k, v] of new URLSearchParams(search))
        query[k] = query[k] ? [query[k], v].flat() : v

      t: try {
        for (let handler of other.before || [])
          if ((response = await handler(request, ...args)) != null) break t

        for (let i = 0; node && i < len; i++) {
          let s = segments[i]
          if (node[2]) {
            for (let h of node[2][method] || []) collected.push([h, i])
            for (let h of node[2]['ALL'] || []) collected.push([h, i])
          }
          node = node[0][s] || node[1] && (params[node[1][0]] = s, node[1][1])
        }

        if (node && node[2]) {
          for (let h of node[2][method] || []) collected.push([h, len])
          for (let h of node[2]['ALL'] || []) collected.push([h, len])
        }
        if (node && node[3]) {
          for (let h of node[3][method] || []) collected.push([h, len])
          for (let h of node[3]['ALL'] || []) collected.push([h, len])
        }

        Object.assign(request, request.params = params)
        request.route = pathname

        o: for (let [handlers, depth] of collected)
          for (let handler of handlers)
            if ((response = await (handler.fetch
              ? handler.fetch({ ...request, url: origin + '/' + segments.slice(depth).join('/') + search, method, headers: request.headers }, ...args)
              : handler(request, ...args)
            )) != null) break o

      } catch (err: any) {
        if (!other.catch) throw err
        response = await other.catch(err, request, ...args)
      }

      try {
        for (let handler of other.after || [])
          response = await handler(response, request, ...args) ?? response
      } catch(err: any) {
        if (!other.catch) throw err
          response = await other.catch(err, request, ...args)
      }

      return response
    },
  } as RouterType<RequestType, Args, ResponseType>

  for (let m of 'delete,get,head,options,patch,post,put,all'.split(','))
    (r as any)[m] = route(m.toUpperCase())

  return r
}

import {
  IRequest,
  RequestLike,
  RouterOptions,
  RouterType
} from './types'

// node: [children, param-child, wildcard-handlers, method-handlers]
// method-handlers: { GET: [...], ALL: [...] }
type TrieNode = [
  Record<string, TrieNode>,                          // static children
  [string, TrieNode] | null,                          // param child: [name, node]
  Record<string, any[][]> | null,                     // wildcard handlers by method
  Record<string, any[][]> | null,                     // leaf handlers by method
]

const newNode = (): TrieNode => [{}, null, null, null]

const addHandlers = (
  map: Record<string, any[][]> | null,
  method: string,
  handlers: any[],
): Record<string, any[][]> => {
  map = map || {}
  ;(map[method] = map[method] || []).push(handlers)
  return map
}

export const FastRouter = <
  RequestType = IRequest,
  Args extends any[] = any[],
  ResponseType = any
>({ base = '', routes = [], ...other }: RouterOptions<RequestType, Args> = {}): RouterType<RequestType, Args, ResponseType> => {
  const root = newNode()

  const insert = (method: string, path: string, handlers: any[]) => {
    path = (base + path).replace(/\/+(\/|$)/g, '$1')  // strip double & trailing slash
    let segments = path.split('/').filter(Boolean)
    let node = root

    // wildcard route — store on current node
    if (!segments.length || segments[segments.length - 1] === '*') {
      if (segments[segments.length - 1] === '*') segments.pop()
      // walk to the right parent node for scoped wildcards like /api/*
      for (let s of segments) {
        if (s[0] === ':') {
          node[1] = node[1] || [s.slice(1), newNode()]
          node = node[1][1]
        } else {
          node[0][s] = node[0][s] || newNode()
          node = node[0][s]
        }
      }
      node[2] = addHandlers(node[2], method, handlers)
      return
    }

    for (let s of segments) {
      if (s[0] === ':') {
        node[1] = node[1] || [s.slice(1), newNode()]
        node = node[1][1]
      } else {
        node[0][s] = node[0][s] || newNode()
        node = node[0][s]
      }
    }
    node[3] = addHandlers(node[3], method, handlers)
  }

  const route = (method: string) =>
    (path: string, ...handlers: any[]) => {
      insert(method, path, handlers)
      routes.push([method, /(?:)/, handlers, path])
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
          pathname = raw.slice(p, q < 0 ? undefined : q),
          search = q < 0 ? '' : raw.slice(q),
          query: Record<string, any> = request.query = { __proto__: null },
          params: Record<string, string> = {},
          collected: [any[], number][] = [],
          segments = pathname.split('/').filter(Boolean),
          node: TrieNode | undefined = root,
          method = request.method

      for (let [k, v] of new URLSearchParams(search))
        query[k] = query[k] ? [query[k], v].flat() : v

      t: try {
        for (let handler of other.before || [])
          if ((response = await handler(request, ...args)) != null) break t

        // walk trie, collect wildcard handlers at each depth
        for (let i = 0; node && i < segments.length; i++) {
          let s = segments[i]
          // collect wildcard handlers at this depth
          if (node[2]) {
            for (let h of node[2][method] || []) collected.push([h, i])
            for (let h of node[2]['ALL'] || []) collected.push([h, i])
          }
          // walk: prefer static > param
          if (node[0][s]) {
            node = node[0][s]
          } else if (node[1]) {
            params[node[1][0]] = s
            node = node[1][1]
          } else {
            node = undefined
          }
        }

        // collect wildcard handlers at leaf depth too
        if (node?.[2]) {
          for (let h of node[2][method] || []) collected.push([h, segments.length])
          for (let h of node[2]['ALL'] || []) collected.push([h, segments.length])
        }

        // collect leaf handlers
        if (node?.[3]) {
          for (let h of node[3][method] || []) collected.push([h, segments.length])
          for (let h of node[3]['ALL'] || []) collected.push([h, segments.length])
        }

        Object.assign(request, request.params = params)
        request.route = pathname

        outer: for (let [handlers, depth] of collected)
          for (let handler of handlers)
            if ((response = await (handler.fetch
              ? handler.fetch({ ...request, url: origin + '/' + segments.slice(depth).join('/') + search, method, headers: request.headers }, ...args)
              : handler(request, ...args)
            )) != null) break outer

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

  for (let m of ['delete','get','head','options','patch','post','put','all'])
    (r as any)[m] = route(m.toUpperCase())

  return r
}

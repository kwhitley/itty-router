![image](https://user-images.githubusercontent.com/865416/79531114-fa0d8200-8036-11ea-824d-70d84164b00a.png)

[![minified + gzipped size](https://badgen.net/bundlephobia/minzip/itty-router)](https://bundlephobia.com/result?p=itty-router)
[![Build Status via Travis CI](https://travis-ci.org/kwhitley/itty-router.svg?branch=v0.x)](https://travis-ci.org/kwhitley/itty-router)
[![Coverage Status](https://coveralls.io/repos/github/kwhitley/itty-router/badge.svg?branch=pr/travis-fix)](https://coveralls.io/github/kwhitley/itty-router?branch=v0.x)

It's an itty bitty router. Like... super tiny, with zero dependencies. For reals.

Did we mention it supports route/query params like in Express.js?

## Installation

```
yarn add itty-router
```

or if you've been transported back to 2017...
```
npm install itty-router
```

## Features
- [x] tiny (< 390 bytes)
- [x] zero dependencies!
- [x] dead-simple usage
- [x] route params, with optionals (e.g. `/api/:foo/:id?`)
- [x] query parsing (e.g. `?page=3`)
- [x] outputs to route handler: `{ params: { foo: 'bar' }, query: { page: '3' }}`
- [x] chainable route declarations (why not?)
- [ ] have pretty code (yeah right...)

# Examples
### Kitchen Sink
```js
import { Router } from 'itty-router'

// create a Router
const router = Router()

// basic GET route
router.get('/todos/:id', console.log)
  
// first match always wins, so be careful with order of registering routes
router
  .get('/todos/oops', () => console.log('you will never see this, thanks to upstream /todos/:id'))
  .get('/features/chainable-route-declaration', () => console.log('yep!'))
  .get('/features/:optionals?', () => console.log('check!')) // will match /features and /features/14 both

// works with POST, DELETE, PATCH, etc
router.post('/todos', () => console.log('posted a todo'))

// ...or any other method we haven't yet thought of (thanks to @mvasigh implementation of Proxy <3)
router.future('/todos', () => console.log(`this caught using the FUTURE method!`))

// then handle a request!
router.handle({ method: 'GET', url: 'https://foo.com/todos/13?foo=bar' })

// ...and viola! the following payload/context is passed to the matching route handler:
// {
//   params: { id: '13' },
//   query: { foo: 'bar' },
//   ...whatever else was in the original request object/class (e.g. method, url, etc)
// }
```

### Within a Cloudflare Function
```js
import { Router } from 'itty-router'

// create a router
const router = Router() // note the intentional lack of "new"

// register some routes
router
  .get('/foo', () => new Response('Foo Index!'))
  .get('/foo/:id', ({ params }) => new Response(`Details for item ${params.id}.`))
  .get('*', () => new Response('Not Found.', { status: 404 })

// attach the router handle to the event handler
addEventListener('fetch', event => event.respondWith(router.handle(event.request)))
```

# Usage 
### 1. Create a Router
```js
import { Router } from 'itty-router'

const router = Router() // no "new", as this is not a real ES6 class/constructor!
```

### 2. Register Route(s)
##### `.methodName(route:string, handler:function)`
The "instantiated" router translates any attribute (e.g. `.get`, `.post`, `.patch`, `.whatever`) as a function that binds a "route" (string) to a route handler (function) on that method type.  When the url fed to `.handle({ url })` matches the route and method, the handler is fired with the original request/context, with the addition of any parsed route/query params.  This allows ANY method to be handled, including completely custom methods (we're very curious how creative individuals will abuse this flexibility!).  The only "method" currently off-limits is `handle`, as that's used for route handling (see below).
```js
router.get('/todos/:user/:item?', (req) => {
  let { params, query, url } = req
  let { user, item } = params
  
  console.log('GET TODOS from', url, { user, item })
})
```

### 3. Handle Incoming Request(s)
##### `.handle(request = { method:string = 'GET', url:string })`
The only requirement for the `.handle(request)` method is an object with a valid **full** url (e.g. `https://example.com/foo`).  The `method` property is optional and defaults to `GET` (which maps to routes registered with `router.get()`).
```js
router.handle({
  method: 'GET',                              // optional, default = 'GET'
  url: 'https://example.com/todos/jane/13',   // required
})

// matched handler from step #2 (above) will execute, with the following output:
// GET TODOS from https://example.com/todos/jane/13 { user: 'jane', item: '13' }
```

## Testing & Contributing
1. fork repo
2. add code
3. run tests (and add your own) `yarn test`
4. submit PR
5. profit

## Entire Router Code (latest...)
```js
const Router = () => new Proxy({}, {
  get: (obj, prop) => prop === 'handle'
    ? (req) => {
      for ([route, handler] of obj[(req.method || 'GET').toLowerCase()] || []) {
        if (hit = (u = new URL(req.url)).pathname.match(route)) {
          return handler(Object.assign(req, {
            params: hit.groups,
            query: Object.fromEntries(u.searchParams.entries()) 
          }))
        }
      }
    } : (path, handler) => 
        (obj[prop] = obj[prop] || []).push([`^${path.replace('*', '.*').replace(/(\/:([^\/\?]+)(\?)?)/gi, '/$3(?<$2>[^\/]+)$3')}$`, handler]) && obj
})
```

## Special Thanks
This repo goes out to my past and present colleagues at Arundo - who have brought me such inspiration, fun, 
and drive over the last couple years.  In particular, the absurd brevity of this code is thanks to a 
clever [abuse] of `Proxy`, courtesy of the brilliant [@mvasigh](https://github.com/mvasigh).  
This trick allows methods (e.g. "get", "post") to by defined dynamically by the router as they are requested, 
**drastically** reducing boilerplate.

## Changelog
Until this library makes it to a production release of v1.x, **minor versions may contain breaking changes to the API**.  After v1.x, semantic versioning will be honored, and breaking changes will only occur under the umbrella of a major version bump.

- **v0.7.0** - removed { path } from  request handler context, travis build fixed, added coveralls, improved README docs
- **v0.6.0** - added types to project for vscode intellisense (thanks [@mvasigh](https://github.com/mvasigh))
- **v0.5.4** - fix: wildcard routes properly supported

![Logo][logo-image]

[![npm package][npm-image]][npm-url]
[![minified + gzipped size][gzip-image]][gzip-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Open Issues][issues-image]][issues-url]

It's an itty bitty router, designed for Express.js-like routing within [Cloudflare Workers](https://developers.cloudflare.com/workers/) (or anywhere else). Like... it's super tiny (~450 bytes), with zero dependencies. For reals.

## Installation

```
npm install itty-router
```

# Simple Example
```js
import { Router } from 'itty-router'

// create a router
const router = Router() // this is a Proxy, not a class

// GET collection index
router.get('/todos', () => new Response('Todos Index!'))

// GET item
router.get('/todos/:id', ({ params }) => new Response(`Todo #${params.id}`))

// POST to the collection (we'll use async here)
router.post('/todos', async request => {
  const content = await request.json()

  return new Response('Creating Todo: ' + JSON.stringify(content))
})

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }))

// attach the router "handle" to the event handler
addEventListener('fetch', event =>
  event.respondWith(router.handle(event.request))
)
```

# Features
- [x] Tiny (~450 bytes) with zero dependencies.
- [x] Full sync/async support.  Use it when you need it!
- [x] Route params, with wildcards and optionals (e.g. `/api/:collection/:id?`)
- [x] Query parsing (e.g. `?page=3&foo=bar`)
- [x] [Middleware support](#middleware). Any number of sync/async handlers may be passed to a route.
- [x] [Nestable](#nested-routers-with-404-handling). Supports nesting routers for API branching.
- [x] [Base path support](#nested-routers-with-404-handling) for prefixing all routes.
- [x] Supports **any** method type (e.g. `router.puppy('/:name', handler)` would work).
- [x] ["All" channel](#nested-routers-with-404-handling) for method-agnostic request matches.
- [x] Extendable. Use itty as the internal base for more feature-rich/elaborate routers.
- [x] Chainable route declarations (why not?)
- [ ] Readable internal code (yeah right...)

# Options API
#### `Router(options = {})`

| Name | Type(s) | Description | Examples |
| --- | --- | --- | --- |
| `base` | `string` | prefixes all routes with this string | `Router({ base: '/api' })`

# Usage
### 1. Create a Router
```js
import { Router } from 'itty-router'

const router = Router() // no "new", as this is not a real class
```

### 2. Register Route(s)
##### `router.{method}(route: string, handler1: function, handler2: function, ...)`
```js
// register a route on the "GET" method
router.get('/todos/:user/:item?', (req) => {
  const { params, query } = req

  console.log({ params, query })
})
```

### 3. Handle Incoming Request(s)
##### `router.handle(request: Request)`
Requests (doesn't have to be a real Request class) should have both a **method** and full **url**.
The `handle` method will then return the first matching route handler that returns something (or nothing at all if no match).

```js
router.handle({
  method: 'GET',                              // optional, default = 'GET'
  url: 'https://example.com/todos/jane/13',   // required
})

/*
Example outputs (using route handler from step #2 above):

GET /todos/jane/13
{
  params: {
    user: 'jane',
    item: '13'
  },
  query: {}
}

GET /todos/jane
{
  params: {
    user: 'jane'
  },
  query: {}
}

GET /todos/jane?limit=2&page=1
{
  params: {
    user: 'jane'
  },
  query: {
    limit: '2',
    page: '2'
  }
}
*/
```

# Examples

### Nested Routers with 404 handling
```js
// lets save a missing handler
const missingHandler = new Response('Not found.', { status: 404 })

// create a parent router
const parentRouter = Router()

// and a child router
const todosRouter = Router({ base: '/todos' })

// with some routes on it...
todosRouter
  .get('/', () => new Response('Todos Index'))
  .get('/:id', ({ params }) => new Response(`Todo #${params.id}`))

// then divert ALL requests to /todos/* into the child router
parentRouter
  .all('/todos/*', todosRouter.handle) // attach child router
  .all('*', missingHandler) // catch any missed routes

// GET /todos --> Todos Index
// GET /todos/13 --> Todo #13
// POST /todos --> missingHandler (caught eventually by parentRouter)
// GET /foo --> missingHandler
```

### Middleware
Any handler that does not **return** will effectively be considered "middleware", continuing to execute future functions/routes until one returns, closing the response.

```js
// withUser modifies original request, but returns nothing
const withUser = request => {
  request.user = { name: 'Mittens', age: 3 }
}

// requireUser optionally returns (early) if user not found on request
const requireUser = request => {
  if (!request.user) {
    return new Response('Not Authenticated', { status: 401 })
  }
}

// showUser returns a response with the user (assumed to exist)
const showUser = request => new Response(JSON.stringify(request.user))

// now let's add some routes
router
  .get('/pass/user', withUser, requireUser, showUser)
  .get('/fail/user', requireUser, showUser)

router.handle({ url: 'https://example.com/pass/user' })
// withUser injects user, allowing requireUser to not return/continue
// STATUS 200: { name: 'Mittens', age: 3 }

router.handle({ url: 'https://example.com/fail/user' })
// requireUser returns early because req.user doesn't exist
// STATUS 401: Not Authenticated
```

### Multi-route (Upstream) Middleware
```js
// middleware that injects a user, but doesn't return
const withUser = request => {
  request.user = { name: 'Mittens', age: 3 }
}

router
  .get('*', withUser) // embeds user before all other matching routes
  .get('/user', request => new Response(`Hello, ${user.name}!`))

router.handle({ url: 'https://example.com/user' })
// STATUS 200: Hello, Mittens!
```

### File format support
```js
// GET item with optional format/extension
router.get('/todos/:id.:format?', request => {
  const { id, format = 'csv' } = request.params

  return new Response(`Getting todo #${id} in ${format} format.`)
})

// GET /todos/13 --> Getting todo #13 in csv format.
// GET /todos/14.json --> Getting todo #14 in json format.
```

## Testing & Contributing
1. Fork repo
1. Install dev dependencies via `yarn`
1. Start test runner/dev mode `yarn dev`
1. Add your code and tests if needed - do NOT remove/alter existing tests
1. Verify that tests pass once minified `yarn verify`
1. Commit files
1. Submit PR with a detailed description of what you're doing
1. I'll add you to the credits! :)

## The Entire Code (for more legibility, [see src on GitHub](https://github.com/kwhitley/itty-router/blob/v1.x/src/itty-router.js))
```js
const Router = (o = {}) =>
  new Proxy(o, {
    get: (t, k, c) => k === 'handle'
      ? async (r, ...a) => {
          for (let [p, hs] of t.r.filter(i => i[2] === r.method || i[2] === 'ALL')) {
            let m, s, u
            if (m = (u = new URL(r.url)).pathname.match(p)) {
              r.params = m.groups
              r.query = Object.fromEntries(u.searchParams.entries())

              for (let h of hs) {
                if ((s = await h(r, ...a)) !== undefined) return s
              }
            }
          }
        }
      : (p, ...hs) =>
          (t.r = t.r || []).push([
            `^${(t.base || '')+p
              .replace(/(\/?)\*/g, '($1.*)?')
              .replace(/\/$/, '')
              .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/$3]+)$2$3')
            }\/*$`,
            hs,
            k.toUpperCase(),
          ]) && c
  })
```

## Special Thanks
This repo goes out to my past and present colleagues at Arundo - who have brought me such inspiration, fun,
and drive over the last couple years.  In particular, the absurd brevity of this code is thanks to a
clever [abuse] of `Proxy`, courtesy of the brilliant [@mvasigh](https://github.com/mvasigh).
This trick allows methods (e.g. "get", "post") to by defined dynamically by the router as they are requested,
**drastically** reducing boilerplate.

[twitter-image]:https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fitty-router
[logo-image]:https://user-images.githubusercontent.com/865416/79531114-fa0d8200-8036-11ea-824d-70d84164b00a.png
[gzip-image]:https://img.shields.io/bundlephobia/minzip/itty-router
[gzip-url]:https://bundlephobia.com/result?p=itty-router
[issues-image]:https://img.shields.io/github/issues/kwhitley/itty-router
[issues-url]:https://github.com/kwhitley/itty-router/issues
[npm-image]:https://img.shields.io/npm/v/itty-router.svg
[npm-url]:http://npmjs.org/package/itty-router
[travis-image]:https://travis-ci.org/kwhitley/itty-router.svg?branch=v1.x
[travis-url]:https://travis-ci.org/kwhitley/itty-router
[david-image]:https://david-dm.org/kwhitley/itty-router/status.svg
[david-url]:https://david-dm.org/kwhitley/itty-router
[coveralls-image]:https://coveralls.io/repos/github/kwhitley/itty-router/badge.svg?branch=v1.x
[coveralls-url]:https://coveralls.io/github/kwhitley/itty-router?branch=v1.x

# Contributors
These folks are the real heroes, making open source the powerhouse that it is!  Help out and get your name added to this list! <3

#### Core, Concepts, and Codebase
- [@technoyes](https://github.com/technoyes) - three kind-of-a-big-deal errors fixed.  Imagine the look on my face... thanks man!! :)
- [@hunterloftis](https://github.com/hunterloftis) - router.handle() method now accepts extra arguments and passed them to route functions
- [@roojay520](https://github.com/roojay520) - TS interface fixes
- [@mvasigh](https://github.com/mvasigh) - proxy hacks courtesy of this chap
#### Documentation Fixes
- [@arunsathiya](https://github.com/arunsathiya)
- [@poacher2k](https://github.com/poacher2k)

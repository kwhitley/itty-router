# [![Itty Router](https://user-images.githubusercontent.com/865416/146679767-16be95b4-5dd7-4bcf-aed7-b8aa8c828f48.png)](https://itty-router.dev)

[![Version](https://img.shields.io/npm/v/itty-router.svg?style=flat-square)](https://npmjs.com/package/itty-router)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/itty-router?style=flat-square)](https://bundlephobia.com/result?p=itty-router)
![Build Status](https://img.shields.io/github/workflow/status/kwhitley/itty-router/build?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/github/kwhitley/itty-router/v2.x?style=flat-square)](https://coveralls.io/github/kwhitley/itty-router?branch=v2.x)
[![NPM Weekly Downloads](https://img.shields.io/npm/dw/itty-router?style=flat-square)](https://npmjs.com/package/itty-router)
[![Open Issues](https://img.shields.io/github/issues/kwhitley/itty-router?style=flat-square)](https://github.com/kwhitley/itty-router/issues)

[![Discord](https://img.shields.io/discord/832353585802903572?style=flat-square)](https://discord.com/channels/832353585802903572)
[![GitHub Repo stars](https://img.shields.io/github/stars/kwhitley/itty-router?style=social)](https://github.com/kwhitley/itty-router)
[![Twitter](https://img.shields.io/twitter/follow/kevinrwhitley.svg?style=social&label=Follow)](https://www.twitter.com/kevinrwhitley)

Tiny, zero-dependency router with route param and query parsing - built for [Cloudflare Workers](https://developers.cloudflare.com/workers/), but works everywhere!

### Addons & Related Libraries
1. [itty-router-extras](https://www.npmjs.com/package/itty-router-extras) - adds quality-of-life improvements and utility functions for simplifying request/response code (e.g. middleware, cookies, body parsing, json handling, errors, and an itty version with automatic exception handling)!
2. [itty-durable](https://github.com/kwhitley/itty-durable) - creates a more direct object-like API for interacting with [Cloudflare Durable Objects](https://developers.cloudflare.com/workers/learning/using-durable-objects).

## Features
- [x] Tiny ([~500 bytes](https://bundlephobia.com/package/itty-router) compressed), with zero dependencies.
- [x] [Fully typed/TypeScript support](#typescript)
- [x] Supports sync/async handlers/middleware.
- [x] Parses route params, with wildcards and optionals (e.g. `/api/:collection/:id?`)
- [x] Query parsing (e.g. `?page=3&foo=bar`)
- [x] [Middleware support](#middleware). Any number of sync/async handlers may be passed to a route.
- [x] [Nestable](#nested-routers-with-404-handling). Supports nesting routers for API branching.
- [x] [Base path](#nested-routers-with-404-handling) for prefixing all routes.
- [x] [Multi-method support](#nested-routers-with-404-handling) using the `.all()` channel.
- [x] Supports **any** method type (e.g. `.get() --> 'GET'` or `.puppy() --> 'PUPPY'`).
- [x] Supports [Cloudflare ES Module syntax](#cf-es6-module-syntax)! :)
- [x] [Preload or manually inject custom regex for routes](#manual-routes) (advanced usage)
- [x] [Extendable](#extending-itty-router). Use itty as the internal base for more feature-rich/elaborate routers.
- [x] Chainable route declarations (why not?)
- [ ] Readable internal code (yeah right...)

## Installation

```
npm install itty-router
```

## Example
```js
import { Router } from 'itty-router'

// now let's create a router (note the lack of "new")
const router = Router()

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

## Options API
#### `Router(options = {})`

| Name | Type(s) | Description | Examples |
| --- | --- | --- | --- |
| `base` | `string` | prefixes all routes with this string | `Router({ base: '/api' })`
| `routes` | `array of routes` | array of manual routes for preloading | [see documentation](#manual-routes)

## Usage
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
##### `async router.handle(request.proxy: Proxy || request: Request, ...anything else) => Promise<any>`
Requests (doesn't have to be a real Request class) should have both a **method** and full **url**.
The `handle` method will then return a Promise, resolving with the first matching route handler that returns something (or nothing at all if no match).

```js
router.handle({
  method: 'GET',                              // required
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

#### A few notes about this:
- **Error Handling:** By default, there is no error handling built in to itty.  However, the handle function is async, allowing you to add a `.catch(error)` like this:

  ```js
  import { Router } from 'itty-router'

  // a generic error handler
  const errorHandler = error =>
    new Response(error.message || 'Server Error', { status: error.status || 500 })

  // add some routes (will both safely trigger errorHandler)
  router
    .get('/accidental', request => request.that.will.throw)
    .get('/intentional', () => {
      throw new Error('Bad Request')
    })

  // attach the router "handle" to the event handler
  addEventListener('fetch', event =>
    event.respondWith(
      router
        .handle(event.request)
        .catch(errorHandler)
    )
  )
  ```
- **Extra Variables:** The router handle expects only the request itself, but passes along any additional params to the handlers/middleware.  For example, to access the `event` itself within a handler (e.g. for `event.waitUntil()`), you could simply do this:

  ```js
  const router = Router()

  router.get('/long-task', (request, event) => {
    event.waitUntil(longAsyncTaskPromise)

    return new Response('Task is still running in the background!')
  })

  addEventListener('fetch', event =>
    event.respondWith(router.handle(event.request, event))
  )
  ```
- **Proxies:** To allow for some pretty incredible middleware hijacks, we pass `request.proxy` (if it exists) or `request` (if not) to the handler.  This allows middleware to set `request.proxy = new Proxy(request.proxy || request, {})` and effectively take control of reads/writes to the request object itself.  As an example, the `withParams` middleware in `itty-router-extras` uses this to control future reads from the request.  It intercepts "get" on the Proxy, first checking the requested attribute within the `request.params` then falling back to the `request` itself.

## Examples

### Nested Routers with 404 handling
```js
// lets save a missing handler
const missingHandler = () => new Response('Not found.', { status: 404 })

// create a parent router
const parentRouter = Router({ base: '/api' })

// and a child router (with FULL base path defined, from root)
const todosRouter = Router({ base: '/api/todos' })

// with some routes on it (these will be relative to the base)...
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

A few quick caveats about nesting... each handler/router is fired in complete isolation, unaware of upstream routers.  Because of this, base paths do **not** chain from parent routers - meaning each child branch/router will need to define its **full** path.

However, as a bonus (from v2.2+), route params will use the base path as well (e.g. `Router({ path: '/api/:collection' })`).

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

router.handle({ method: 'GET', url: 'https://example.com/pass/user' })
// withUser injects user, allowing requireUser to not return/continue
// STATUS 200: { name: 'Mittens', age: 3 }

router.handle({ method: 'GET', url: 'https://example.com/fail/user' })
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

router.handle({ method: 'GET', url: 'https://example.com/user' })
// STATUS 200: Hello, Mittens!
```

### File format support
```js
// GET item with optional format/extension
router.get('/todos/:id.:format?', request => {
  const { id, format = 'csv' } = request.params

  return new Response(`Getting todo #${id} in ${format} format.`)
})
```

### Cloudflare ES6 Module Syntax (required for Durable Objects) <a id="cf-es6-module-syntax"></a>
See https://developers.cloudflare.com/workers/runtime-apis/fetch-event#syntax-module-worker
```js
import { Router } from 'itty-router'

const router = Router()

router.get('/', (request, env, context) => {
  // now have access to the env (where CF bindings like durables, KV, etc now are)
})

export default {
  fetch: router.handle // yep, it's this easy.
}

// alternative advanced/manual approach for downstream control
export default {
  fetch: (...args) => router
                        .handle(...args)
                        .then(response => {
                          // can modify response here before final return, e.g. CORS headers

                          return response
                        })
                        .catch(err => {
                          // and do something with the errors here, like logging, error status, etc
                        })
}
```

### Extending itty router
Extending itty is as easy as wrapping Router in another Proxy layer to control the handle (or the route registering).  For example, here's the code to
ThrowableRouter in itty-router-extras... a version of itty with built-in error-catching for convenience.
```js
import { Router } from 'itty-router'

// a generic error handler
const errorHandler = error =>
  new Response(error.message || 'Server Error', { status: error.status || 500 })

// and the new-and-improved itty
const ThrowableRouter = (options = {}) =>
  new Proxy(Router(options), {
    get: (obj, prop) => (...args) =>
        prop === 'handle'
        ? obj[prop](...args).catch(errorHandler)
        : obj[prop](...args)
  })

// 100% drop-in replacement for Router
const router = ThrowableRouter()

// add some routes
router
  .get('/accidental', request => request.that.will.throw) // will safely trigger error (above)
  .get('/intentional', () => {
    throw new Error('Bad Request') // will also trigger error handler
  })
```

### Manual Routes
Thanks to a pretty sick refactor by [@taralx](https://github.com/taralx), we've added the ability to fully preload or push manual routes with hand-written regex.

Why is this useful?

Out of the box, only a tiny subset of regex "accidentally" works with itty, given that... you know... it's the thing writing regex for you in the first place.  If you have a problem route that needs custom regex though, you can now manually give itty the exact regex it will match against, through the far-less-user-friendly-but-totally-possible manual injection method (below).

Individual routes are defined as an array of: `[ method: string, match: RegExp, handlers: Array<function> ]`

###### EXAMPLE 1: Manually push a custom route
```js
import { Router } from 'itty-router'

const router = Router()

// let's define a simple request handler
const handler = request => request.params

// and manually push a route onto the internal routes collection
router.routes.push(
  [
    'GET',                        // method: GET
    /^\/custom-(?<id>\w\d{3})$/,  // regex match with named groups (e.g. "id")
    [handler],                    // array of request handlers
  ]
)

await router.handle({ method: 'GET', url: 'https:nowhere.com/custom-a123' })    // { id: "a123" }
await router.handle({ method: 'GET', url: 'https:nowhere.com/custom-a12456' })  // won't catch
```


###### EXAMPLE 2: Preloading routes via Router options
```js
import { Router } from 'itty-router'

// let's define a simple request handler
const handler = request => request.params

// and load the route while creating the router
const router = Router({
  routes: [
    [ 'GET', /^\/custom-(?<id>\w\d{3})$/, [handler] ], // same example as above, but shortened
  ]
})

// add routes normally...
router.get('/test', () => new Response('You can still define routes normally as well...'))

// router will catch on custom route, as expected
await router.handle({ method: 'GET', url: 'https:nowhere.com/custom-a123' })    // { id: "a123" }
```

### Typescript

For Typescript projects, the Router can be adorned with two generics: A custom request interface and a custom methods interface.

```ts
import { Router, Route, Request } from 'itty-router'

type MethodType = 'GET' | 'POST' | 'PUPPY'

interface IRequest extends Request {
  method: MethodType // method is required to be on the interface
  url: string // url is required to be on the interface
  optional?: string
}

interface IMethods {
  get: Route
  post: Route
  puppy: Route
}

const router = Router<IRequest, IMethods>()

router.get('/', (request: IRequest) => {})
router.post('/', (request: IRequest) => {})
router.puppy('/', (request: IRequest) => {})

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(router.handle(event.request))
})
```

Both generics are optional. `TRequest` defaults to `Request` and `TMethods` defaults to `{}`.

```ts
import { Router, Route } from 'itty-router'

type MethodType = 'GET' | 'POST' | 'PUPPY'

interface IRequest extends Request {
  method: MethodType
  url: string
  optional?: string
}

interface IMethods {
  get: Route
  post: Route
  puppy: Route
}

const router = Router() // Valid
const router = Router<IRequest>() // Valid
const router = Router<Request, IMethods>() // Valid
const router = Router<void, IMethods>() // Valid
```

The router will also accept any string as a method, not just those provided on the `TMethods` type.

```ts
import { Router, Route } from 'itty-router'

interface IMethods {
  get: Route
  post: Route
  puppy: Route
}

const router = Router<void, IMethods>()

router.puppy('/', request => {}) // Valid
router.kitten('/', request => {}) // Also Valid
```

The `itty-router` package also exports an interface containing all of the HTTP methods.

```ts
import { Router, Route, IHTTPMethods } from 'itty-router'

const router = Router<void, IHTTPMethods>()

router.get('/', request => {}) // Exposed via IHTTPMethods
router.puppy('/', request => {}) // Valid but not strongly typed
```

You can also extend `IHTTPMethods` with your own custom methods so they will be strongly typed.

```ts
import { Router, Route, IHTTPMethods } from 'itty-router'

interface IMethods extends IHTTPMethods {
  puppy: Route
}

const router = Router<void, IMethods>()

router.get('/', request => {}) // Exposed via IHTTPMethods
router.puppy('/', request => {}) // Strongly typed
```

## Testing and Contributing
1. Fork repo
1. Install dev dependencies via `yarn`
1. Start test runner/dev mode `yarn dev`
1. Add your code and tests if needed - do NOT remove/alter existing tests
1. Verify that tests pass once minified `yarn verify`
1. Commit files
1. Submit PR with a detailed description of what you're doing
1. I'll add you to the credits! :)

## Special Thanks
This repo goes out to my past and present colleagues at Arundo - who have brought me such inspiration, fun,
and drive over the last couple years.  In particular, the absurd brevity of this code is thanks to a
clever [abuse] of `Proxy`, courtesy of the brilliant [@mvasigh](https://github.com/mvasigh).
This trick allows methods (e.g. "get", "post") to by defined dynamically by the router as they are requested,
**drastically** reducing boilerplate.

## Contributors
These folks are the real heroes, making open source the powerhouse that it is!  Help out and get your name added to this list! <3

#### Core, Concepts, and Codebase
- [@mvasigh](https://github.com/mvasigh) - proxy hack wizard behind itty, coding partner in crime, maker of the entire doc site, etc, etc.
- [@taralx](https://github.com/taralx) - router internal code-golfing refactor for performance and character savings
- [@hunterloftis](https://github.com/hunterloftis) - router.handle() method now accepts extra arguments and passed them to route functions
- [@SupremeTechnopriest](https://github.com/SupremeTechnopriest) - improved TypeScript support and documentation! :D
#### Fixes
- [@taralx](https://github.com/taralx) - QOL fixes for contributing (dev dep fix and test file consistency) <3
- [@technoyes](https://github.com/technoyes) - three kind-of-a-big-deal errors fixed.  Imagine the look on my face... thanks man!! :)
- [@roojay520](https://github.com/roojay520) - TS interface fixes
#### Documentation
- [@arunsathiya](https://github.com/arunsathiya),
  [@poacher2k](https://github.com/poacher2k),
  [@ddarkr](https://github.com/ddarkr),
  [@kclauson](https://github.com/kclauson),
  [@jcapogna](https://github.com/jcapogna)

<p align="center">
  <a href="https://itty.dev/itty-router">
     <img src="https://github.com/kwhitley/itty-router/assets/865416/7751dac0-2dc8-4754-8b39-d08fc2144b4f" alt="Itty Router" />
  </a>
<p>
  
---
<h2 align="center"><a href="https://itty.dev/itty-router">v4.x Documentation @ itty.dev</a>
<br /></h2>

<p align="center">
  <a href="https://npmjs.com/package/itty-router" target="_blank">
    <img src="https://img.shields.io/npm/v/itty-router.svg?style=flat-square" alt="npm version" />
  </a>
  <a href="https://deno.bundlejs.com/?q=itty-router/Router" target="_blank">
    <img src="https://deno.bundlejs.com/?q=itty-router/Router&badge&badge-style=flat-square" alt="bundle size" />
  </a>
  <a href="https://github.com/kwhitley/itty-router/actions/workflows/verify.yml" target="_blank">
    <img src="https://img.shields.io/github/actions/workflow/status/kwhitley/itty-router/verify.yml?branch=v4.x&style=flat-square" alt="build status" />
  </a>
  <a href="https://coveralls.io/github/kwhitley/itty-router?branch=v4.x" target="_blank">
    <img src="https://img.shields.io/coveralls/github/kwhitley/itty-router/v4.x?style=flat-square" alt="code coverage" />
  </a>
  <a href="https://npmjs.com/package/itty-router" target="_blank">
    <img src="https://img.shields.io/npm/dw/itty-router?style=flat-square" alt="weekly downloads" />
  </a>
  <a href="https://github.com/kwhitley/itty-router/issues" target="_blank">
    <img src="https://img.shields.io/github/issues/kwhitley/itty-router?style=flat-square" alt="open issues" />
  </a>
  <a href="" target="_blank">
    <img src="" alt="" />
  </a>
</p>

<p align="center">
  <a href="https://discord.com/channels/832353585802903572" target="_blank">
    <img src="https://img.shields.io/discord/832353585802903572?style=flat-square" alt="join us on discord" />
  </a>
  <a href="https://github.com/kwhitley/itty-router" target="_blank">
    <img src="https://img.shields.io/github/stars/kwhitley/itty-router?style=social" alt="repo stars" />
  </a>
  <a href="https://www.twitter.com/kevinrwhitley" target="_blank">
    <img src="https://img.shields.io/twitter/follow/kevinrwhitley.svg?style=social&label=Follow" alt="follow the author" />
  </a>
  <a href="" target="_blank">
    <img src="" alt="" />
  </a>
</p>

---

Itty is arguably the smallest (~450 bytes) feature-rich JavaScript router available, while enabling dead-simple API code.

Designed originally for [Cloudflare Workers](https://itty.dev/itty-router/runtimes#Cloudflare%20Workers), itty can be used in browsers, service workers, edge functions, or runtimes like [Node](https://itty.dev/itty-router/runtimes#Node), [Bun](https://itty.dev/itty-router/runtimes#Bun), etc.!

## Features

- Tiny, tree-shakeable. [~450](https://deno.bundlejs.com/?q=itty-router/Router) bytes for the Router itself, or [~1.6k](https://bundlephobia.com/package/itty-router) for the entire library (>100x smaller than [express.js](https://www.npmjs.com/package/express)).
- [Fully-Typed](https://itty.dev/itty-router/typescript).
- Shorter, simpler route code than most modern routers.
- Dead-simple [middleware](https://itty.dev/itty-router/middleware) - use ours or write your own.
- Supports [nested APIs](https://itty.dev/itty-router/nesting).
- Platform agnostic (based on [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)) - use it [anywhere, in any environment](https://itty.dev/itty-router/runtimes).
- Parses [route params](https://itty.dev/itty-router/route-patterns#params),
  [optional params](https://itty.dev/itty-router/route-patterns#optional),
  [wildcards](https://itty.dev/itty-router/route-patterns#wildcards),
  [greedy params](https://itty.dev/itty-router/route-patterns#greedy),
  [file formats](https://itty.dev/itty-router/route-patterns#file-formats)
  and [query strings](https://itty.dev/itty-router/route-patterns#query).
- Extremely extendable/flexible.  We leave you in complete control.

## [Full Documentation](https://itty.dev/itty-router)

Complete API documentation is available at [itty.dev/itty-router](https://itty.dev/itty-router), or join our [Discord](https://discord.com/channels/832353585802903572) channel to chat with community members for quick help!

## Installation

```
npm install itty-router
```

## Example

```js
import {
  error,      // creates error responses
  json,       // creates JSON responses
  Router,     // the ~440 byte router itself
  withParams, // middleware: puts params directly on the Request
} from 'itty-router'
import { todos } from './external/todos'

// create a new Router
const router = Router()

router
  // add some middleware upstream on all routes
  .all('*', withParams)

  // GET list of todos
  .get('/todos', () => todos)

  // GET single todo, by ID
  .get(
    '/todos/:id',
    ({ id }) => todos.getById(id) || error(404, 'That todo was not found')
  )

  // 404 for everything else
  .all('*', () => error(404))

// Example: Cloudflare Worker module syntax
export default {
  fetch: (request, ...args) =>
    router
      .handle(request, ...args)
      .then(json)     // send as JSON
      .catch(error),  // catch errors
}
```

# What's different about itty? <a name="a-different-kind-of-router"></a>
Itty does a few things very differently from other routers.  This allows itty route code to be shorter and more intuitive than most!

### 1. Simpler handler/middleware flow.
In itty, you simply return (anything) to exit the flow.  If any handler ever returns a thing, that's what the `router.handle` returns.  If it doesn't, it's considered middleware, and the next handler is called. 

That's it!

```ts
// not middleware: any handler that returns (anything at all)
(request) => [1, 4, 5, 1]

// middleware: simply doesn't return
const withUser = (request) => { 
  request.user = 'Halsey'
}

// a middleware that *might* return
const onlyHalsey = (request) => {
  if (request.user !== 'Halsey') {
    return error(403, 'Only Halsey is allowed to see this!')
  }
}

// uses middleware, then returns something
route.get('/secure', withUser, onlyHalsey,
  ({ user }) => `Hey, ${user} - welcome back!`
)
```

### 2. You don't have to build a response in each route handler.
We've been stuck in this pattern for over a decade.  Almost every router still expects you to build and return a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)... in every single route.  

We think you should be able to do that once, at the end. In most modern APIs for instance, we're serving JSON in the majority of our routes.  So why handle that more than once?
```ts
router
  // we can still do it the manual way
  .get('/traditional', (request) => json([1, 2, 3]))

  // or defer to later
  .get('/easy-mode', (request) => [1, 2, 3])

// later, when handling a request
router
  .handle(request)
  .then(json) // we can turn any non-Response into valid JSON.
```

### 3. It's all Promises.
We `await` every handler, looking for a return value.  If we get one, we break the flow and return your value.  If we don't, we continue processing handlers/routes until we do.  This means that every handler can either be synchronous or async - it's all the same.

When paired with the fact that we can simply return raw data and transform it later, this is AWESOME for working with async APIs, database layers, etc.  We don't need to transform anything at the route, we can simply return the Promise (to data) itself!

Check this out:
```ts
import { myDatabase } from './somewhere'

router
  // assumes getItems() returns a Promise to some data
  .get('/items', () => myDatabase.getItems())

// later, when handling a request
router
  .handle(request)
  .then(json) // we can turn any non-Response into valid JSON.
```

### 4. Only one required argument.  The rest is up to you.
We only require one argument in itty - a Request-like object with the following shape: `{ url, method }` (usually a native [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)).  Because itty is not opinionated about [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) creation, there is not "response" argument built in.  Every other argument you pass to `route.handle` is given to each handler, in the same order.  

> ### This makes itty one of the most platform-agnostic routers, *period*, as it's able to match up to any platform's signature.

Here's an example using [Cloudflare Worker](https://workers.cloudflare.com/) arguments:
```ts
router
  .get('/my-route', (request, environment, context) => {
    // we can access anything here that was passed to `router.handle`.
  })

// Cloudflare gives us 3 arguments: request, environment, and context.
// Passing them to `route.handle` gives every route handler (above) access to each.  
export default {
  fetch: (request, env, ctx) => router
                                  .handle(request, env, ctx)
                                  .then(json)
                                  .catch(error)
}
```

## Join the Discussion!

Have a question? Suggestion? Complaint? Want to send a gift basket?

Join us on [Discord](https://discord.com/channels/832353585802903572)!

## Testing and Contributing

1. Fork repo
1. Install dev dependencies via `yarn`
1. Start test runner/dev mode `yarn dev`
1. Add your code and tests if needed - do NOT remove/alter existing tests
1. Commit files
1. Submit PR (and fill out the template)
1. I'll add you to the credits! :)

## Special Thanks: Contributors

These folks are the real heroes, making open source the powerhouse that it is! Help out and get your name added to this list! <3

#### Core Concepts

- [@mvasigh](https://github.com/mvasigh) - proxy hack wizard behind itty, coding partner in crime, maker of the entire doc site, etc, etc.
- [@hunterloftis](https://github.com/hunterloftis) - router.handle() method now accepts extra arguments and passed them to route functions
- [@SupremeTechnopriest](https://github.com/SupremeTechnopriest) - improved TypeScript support and documentation! :D

#### Code Golfing

- [@taralx](https://github.com/taralx) - router internal code-golfing refactor for performance and character savings
- [@DrLoopFall](https://github.com/DrLoopFall) - v4.x re-minification

#### Fixes & Build

- [@taralx](https://github.com/taralx) - QOL fixes for contributing (dev dep fix and test file consistency) <3
- [@technoyes](https://github.com/technoyes) - three kind-of-a-big-deal errors fixed. Imagine the look on my face... thanks man!! :)
- [@roojay520](https://github.com/roojay520) - TS interface fixes
- [@jahands](https://github.com/jahands) - v4.x TS fixes

#### Documentation

- [@arunsathiya](https://github.com/arunsathiya),
  [@poacher2k](https://github.com/poacher2k),
  [@ddarkr](https://github.com/ddarkr),
  [@kclauson](https://github.com/kclauson),
  [@jcapogna](https://github.com/jcapogna)

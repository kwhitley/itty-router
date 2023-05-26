<p align="center">
  <a href="https://itty.dev/itty-router">
     <img src="https://github.com/kwhitley/itty-router/assets/865416/7751dac0-2dc8-4754-8b39-d08fc2144b4f" alt="Itty Router" />
  </a>
<p>
  
---
<h3 align="center"><a href="https://itty.dev/itty-router">v4.x Documentation @ itty.dev</a></h3>

<p align="center">
  <a href="https://npmjs.com/package/itty-router" target="_blank">
    <img src="https://img.shields.io/npm/v/itty-router.svg?style=flat-square" alt="npm version" />
  </a>
  <a href="https://bundlephobia.com/result?p=itty-router" target="_blank">
    <img src="https://img.shields.io/bundlephobia/minzip/itty-router?style=flat-square" alt="bundle size" />
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

Itty aims to be the world's smallest (~440 bytes), feature-rich JavaScript router, enabling beautiful API code with a near-zero bundlesize.  Designed originally for [Cloudflare Workers](https://itty.dev/itty-router/runtimes#Cloudflare%20Workers), itty can be used in browsers, Service Workers, edge functions, or standalone runtimes like [Node](https://itty.dev/itty-router/runtimes#Node), [Bun](https://itty.dev/itty-router/runtimes#Bun), etc.!

## Features:
- [fully typed/TypeScript support](https://itty.dev/itty-router#typescript)
- [route params](https://itty.dev/itty-router/route-patterns#params) (including [optional params](https://itty.dev/itty-router/route-patterns#optional))
- [wildcards](https://itty.dev/itty-router/route-patterns#wildcards) and [greedy params](https://itty.dev/itty-router/route-patterns#greedy)
- [query parsing](https://itty.dev/itty-router/route-patterns#query)
- [middleware](https://itty.dev/itty-router/middleware)
- [router nesting](https://itty.dev/itty-router/nesting)
- lightweight, easy-to-understand route code
- works in virtually [*any* runtime/environment](https://itty.dev/itty-router/runtimes) (including the browser)

## [Full Documentation](https://itty.dev/itty-router)
Complete docs/API are available at [itty.dev](https://itty.dev/itty-router), or join our [Discord](https://discord.com/channels/832353585802903572) channel to chat!

## Installation
```
npm install itty-router@next
```

## Example
```js
import { 
  error,                  // creates error responses
  json,                   // creates JSON responses
  Router,                 // the ~440 byte router itself
  withParams,             // middleware: puts params directly on the Request
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
  .get('/todos/:id', 
    ({ id }) => todos.getById(id) || error(404, 'That todo was not found')
  )

  // 404 for everything else
  .all('*', () => error(404))

// Example: Cloudflare Worker module syntax
export default {
  fetch: (request, ...args) => router
                                 .handle(request, ...args)
                                 .then(json)    // send as JSON
                                 .catch(error)  // catch errors
}
```

## Join the Discussion!
Have a question? Suggestion? Complaint? Want to send me a gift basket?

Join us on [Discord](https://discord.com/channels/832353585802903572)!

## Testing and Contributing
1. Fork repo
1. Install dev dependencies via `yarn`
1. Start test runner/dev mode `yarn dev`
1. Add your code and tests if needed - do NOT remove/alter existing tests
1. Verify that tests pass once minified `yarn verify`
1. Commit files
1. Submit PR with a detailed description of what you're doing
1. I'll add you to the credits! :)

## Special Thanks: Contributors
These folks are the real heroes, making open source the powerhouse that it is!  Help out and get your name added to this list! <3

#### Core Concepts
- [@mvasigh](https://github.com/mvasigh) - proxy hack wizard behind itty, coding partner in crime, maker of the entire doc site, etc, etc.
- [@hunterloftis](https://github.com/hunterloftis) - router.handle() method now accepts extra arguments and passed them to route functions
- [@SupremeTechnopriest](https://github.com/SupremeTechnopriest) - improved TypeScript support and documentation! :D
#### Code Golfing
- [@taralx](https://github.com/taralx) - router internal code-golfing refactor for performance and character savings
- [@DrLoopFall](https://github.com/DrLoopFall) - v4.x re-minification
#### Fixes & Build
- [@taralx](https://github.com/taralx) - QOL fixes for contributing (dev dep fix and test file consistency) <3
- [@technoyes](https://github.com/technoyes) - three kind-of-a-big-deal errors fixed.  Imagine the look on my face... thanks man!! :)
- [@roojay520](https://github.com/roojay520) - TS interface fixes
- [@jahands](https://github.com/jahands) - v4.x TS fixes
#### Documentation
- [@arunsathiya](https://github.com/arunsathiya),
  [@poacher2k](https://github.com/poacher2k),
  [@ddarkr](https://github.com/ddarkr),
  [@kclauson](https://github.com/kclauson),
  [@jcapogna](https://github.com/jcapogna)

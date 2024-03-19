<p align="center">
  <a href="https://itty.dev/itty-router">
     <img src="https://github.com/kwhitley/itty-router/assets/865416/319e4148-0a2d-4396-b18b-9e1cbb8e27b6" alt="Itty Router" />
  </a>
<p>
  
<h2 align="center"><a href="https://itty.dev/itty-router">Documentation @ itty.dev</a>
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
  <a href="https://discord.gg/53vyrZAu9u" target="_blank">
    <img src="https://img.shields.io/discord/832353585802903572?label=Discord&logo=Discord&style=flat-square&logoColor=fff" alt="join us on discord" />
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

An ultra-tiny API microrouter, for use when [size matters](https://github.com/TigersWay/cloudflare-playground) (e.g. [Cloudflare Workers](https://developers.cloudflare.com/workers/)).

## Features

- Tiny. We have routers from [~450 bytes](https://itty.dev/itty-router/routers/ittyrouter) to a [~1kB bytes](https://itty.dev/itty-router/routers/autorouter) batteries-included version.  For comparison, [express.js](https://www.npmjs.com/package/express) is over 200x as large.
- Web Standards - Use it [anywhere, in any environment](https://itty.dev/itty-router/runtimes).
- No assumptions. Return anything you like, pass in any arguments you like.
- Future-proof.  HTTP methods not-yet-invented already work with it.
- [Route-parsing](https://itty.dev/itty-router/route-patterns) & [query parsing](https://itty.dev/itty-router/route-patterns#query).
- [Middleware](https://itty.dev/itty-router/middleware) - use ours or write your own.
- [Nesting](https://itty.dev/itty-router/nesting).

## Example (Cloudflare Worker or Bun)

```js
import { AutoRouter } from 'itty-router' // ~1kB

export default AutoRouter()
  .get('/text', () => 'Hey there!')
  .get('/json', () => [1,2,3])
  .get('/hello/:name', ({ name = 'World' }) => `Hello, ${name}!`)
  .get('/promises', () => Promise.resolve('foo'))

// that's it ^
```

## [Full Documentation](https://itty.dev/itty-router)

Complete API documentation is available at [itty.dev/itty-router](https://itty.dev/itty-router), or join our [Discord](https://discord.gg/53vyrZAu9u) channel to chat with community members for quick help!

## Join the Discussion!

Have a question? Suggestion? Complaint? Want to send a gift basket?

Join us on [Discord](https://discord.gg/53vyrZAu9u)!

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
- and many, many others

#### Documentation

- [@arunsathiya](https://github.com/arunsathiya),
  [@poacher2k](https://github.com/poacher2k),
  [@ddarkr](https://github.com/ddarkr),
  [@kclauson](https://github.com/kclauson),
  [@jcapogna](https://github.com/jcapogna)

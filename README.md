<p align="center">
  <a href="https://itty.dev/itty-router">
     <img src="https://github.com/kwhitley/itty-router/assets/865416/319e4148-0a2d-4396-b18b-9e1cbb8e27b6" alt="Itty Router" />
  </a>
  <br /><br />
<p>

<p align="center">
  <a href="https://npmjs.com/package/itty-router" target="_blank">
    <img src="https://img.shields.io/npm/v/itty-router.svg?style=flat-square" alt="npm version" />
  </a>
  <a href="https://edge.bundlejs.com/?q=itty-router/Router" target="_blank">
    <img src="https://edge.bundlejs.com/?q=itty-router/Router&badge&badge-style=flat-square" alt="bundle size" />
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

  <br />

  <a href="https://discord.gg/53vyrZAu9u" target="_blank">
    <img src="https://img.shields.io/discord/832353585802903572?label=Discord&logo=Discord&style=flat-square&logoColor=fff" alt="join us on discord" />
  </a>
  <a href="https://github.com/kwhitley/itty-router" target="_blank">
    <img src="https://img.shields.io/github/stars/kwhitley/itty-router?style=social" alt="repo stars" />
  </a>
  <a href="https://www.twitter.com/ittydev" target="_blank">
    <img src="https://img.shields.io/twitter/follow/ittydev.svg?style=social&label=Follow" alt="follow ittydev" />
  </a>
  <a href="" target="_blank">
    <img src="" alt="" />
  </a>
</p>

###  [v5.x Documentation](https://itty.dev/itty-router) &nbsp; | &nbsp; [Discord](https://discord.gg/53vyrZAu9u)

---

An ultra-tiny API microrouter, for use when [size matters](https://github.com/TigersWay/cloudflare-playground) (e.g. [Cloudflare Workers](https://developers.cloudflare.com/workers/)).




## Features

- Tiny. Routers from [~450 bytes](https://itty.dev/itty-router/routers/ittyrouter) to a [~970 bytes](https://itty.dev/itty-router/routers/autorouter) batteries-included version (~240-500x smaller than Express.js).
- Web Standards. Use it [anywhere, in any environment](https://itty.dev/itty-router/runtimes).
- No assumptions. Return anything; pass in anything.
- Dead-simple user-code.  We want _your_ code to be tiny too.
- Future-proof.  HTTP methods not-yet-invented already work with it.
- [Route-parsing](https://itty.dev/itty-router/route-patterns) & [query parsing](https://itty.dev/itty-router/route-patterns#query).
- [Middleware](https://itty.dev/itty-router/middleware) - use ours or write your own.
- [Supports Nesting](https://itty.dev/itty-router/nesting).

## Example

```js
import { AutoRouter } from 'itty-router' // ~1kB

const router = AutoRouter()

router
  .get('/hello/:name', ({ name }) => `Hello, ${name}!`)
  .get('/json', () => [1,2,3])
  .get('/promises', () => Promise.resolve('foo'))

export default router

// that's it ^-^
```

<br />

## Need Help?
[Complete API documentation](https://itty.dev/itty-router) is available on [itty.dev](https://itty.dev/itty-router), or join our [Discord](https://discord.gg/53vyrZAu9u) channel to chat with community members for quick help!

## Join the Discussion!
Have a question? Suggestion? Idea? Complaint? Want to send a gift basket? Join us on [Discord](https://discord.gg/53vyrZAu9u)!

# A Special Thanks :heart:

As the community and contributor list has grown (and thus an individualized list here is no longer easily maintainable), I'd like to thank each and every one of you for making itty far greater than its humble origins.  The robustness you see today, the careful consideration of every byte spent on features, the API choices, the code-golfing itself... are all thanks to the efforts and feedback from the community.  I'd especially like to thank the core contributors and PR-authors, as well as the fantastic folks on the [itty Discord](https://discord.gg/53vyrZAu9u) group, for their tireless work refining this little beast and answering community questions.



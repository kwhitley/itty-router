# v5 → v6 Migration Guide

## Breaking Changes

### `finally` → `after`

The `finally` option has been renamed to `after` to avoid collision with the JS reserved word.

```js
// v5
Router({ finally: [json] })

// v6
Router({ after: [json] })
```

TypeScript will show a deprecation hint if you use `finally`.

### `missing` → `notFound` (AutoRouter)

```js
// v5
AutoRouter({ missing: () => error(418) })

// v6
AutoRouter({ notFound: () => error(418) })
```

TypeScript will show a deprecation hint if you use `missing`.

### `withParams` removed

Params are now assigned directly to the request during route matching. No middleware needed.

```js
// v5
import { withParams } from 'itty-router'
router.get('/:id', withParams, ({ id }) => `Item ${id}`)

// v6
router.get('/:id', ({ id }) => `Item ${id}`)
```

The `withParams` export has been removed from the barrel. Direct imports (`itty-router/withParams`) still work as a no-op with a deprecation notice.

### Router/AutoRouter deproxied

Router and AutoRouter no longer use Proxy for HTTP method registration. This resolves edge-case issues in certain environments. IttyRouter retains Proxy-based method handling as the lightweight option.

### Error messages trimmed

Only 404 and 500 have built-in messages. Other status codes return `{ status }` only unless you provide a message.

```js
error(404)                          // → { status: 404, error: "Not Found" }
error(500)                          // → { status: 500, error: "Internal Server Error" }
error(401)                          // → { status: 401 }
error(401, 'Unauthorized')          // → { status: 401, error: "Unauthorized" }
error(401, { errorType: 'Auth' })   // → { status: 401, errorType: "Auth" }
```

## New Features

### Built-in withParams

Route params are assigned directly to the request during matching. No middleware needed.

```js
router.get('/:id', ({ id }) => `Item ${id}`)
```

### `cors:` option on AutoRouter

```js
// v5
const { preflight, corsify } = cors()
AutoRouter({ before: [preflight], finally: [corsify] })

// v6
AutoRouter({ cors: cors({ origin: 'https://example.com' }) })
```

### `catch: false` for nested routers

Prevents child AutoRouters from eating errors, letting them bubble to the parent.

```js
const child = AutoRouter({ base: '/api', catch: false })
  .get('/fail', () => { throw new Error('oops') })

const parent = AutoRouter({ catch: myErrorLogger })
  .all('/api/*', child.fetch)
// parent's catch handler fires
```

### Base-free router nesting

Pass a router object directly as a handler — no `base` needed, no `.fetch` needed.

```js
// v5
const child = Router({ base: '/api' }).get('/:id', handler)
const parent = Router().all('/api/*', child.fetch)

// v6
const child = Router().get('/:id', handler)
const parent = Router().all('/api/*', child)
```

Parent and child params are both accessible:

```js
const child = Router().get('/:itemSlug', ({ collectionSlug, itemSlug }) => {
  // both params available
})
const parent = Router().all('/collection/:collectionSlug/*', child)
```

### Custom error payloads

Pass any object shape to `error()`:

```js
error(401, {
  errorType: 'Unauthorized',
  details: 'You are not logged in.',
})
// → { status: 401, errorType: "Unauthorized", details: "You are not logged in." }
```

## Bundle Sizes (gzip)

| Bundle | v5 | v6 | Delta |
|---|---|---|---|
| **Router.mjs** | 520 B | 617 B | +97 B |
| **AutoRouter.mjs** | 949 B | 964 B | +15 B |
| **IttyRouter.mjs** | 445 B | 449 B | +4 B |
| **index.mjs** | 1.70 KB | 1.72 KB | +20 B |
| error.mjs | 387 B | 325 B | -62 B |
| cors.mjs | 479 B | 438 B | -41 B |
| StatusError.mjs | 148 B | 144 B | -4 B |
| withCookies.mjs | 148 B | 140 B | -8 B |

Router's +97 B buys: deproxied verbs, built-in withParams, and base-free nesting. AutoRouter's +15 B adds the `cors:` option and `notFound` rename on top of that.

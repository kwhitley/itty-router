# itty-router
[![minified + gzipped size](https://badgen.net/bundlephobia/minzip/itty-router)](https://bundlephobia.com/result?p=itty-router)
[![Build Status via Travis CI](https://travis-ci.org/kwhitley/itty-router.svg?branch=master)](https://travis-ci.org/kwhitley/itty-router)
It's an itty bitty router. That means small.  It's tiny.  For reals.

## Installation

```
yarn add itty-router
```

or if you've been transported back to 2017...
```
npm install itty-router
```

## Our Goals
- [ ] have a simple express-like (or better) interface
- [x] have a chainable interface!
- [x] be tiny
- [x] be easy to use/implement
- [ ] have as few dependencies as possible (or none)
- [x] have test coverage
- [x] have a README
- [x] have a way to release
- [ ] have pretty code
- [ ] handle all the basics of routing within a serverless function
- [ ] be platform agnostic (or handle the responses of the major platforms)

## Example
```js
import { Router } from 'itty-router'

// create a Router
const router = Router()

// basic GET routs
router.get('/todos/:id', console.log)
  
// first match always wins, so be careful with order of registering routes
router
  .get('/todos/oops', () => console.log('you will never see this'))
  .get('/chainable', () => console.log('because why not?')) // this may be dropped to save characters...

// works with POST, DELETE, PATCH, etc
router.post('/todos', () => console.log('posted a todo'))

// ...or any other method we haven't yet thought of (thanks to @mvasigh implementation of Proxy <3)
router.future('/todos', () => console.log(`this caught using the FUTURE method!`))

// then handle a request!
router.handle({ method: 'GET', url: 'https://foo.com/todos/13?foo=bar' })
// {
//   method: 'GET',
//   url: 'http://foo.com/todos/13?foo=bar',
//   path: '/todos/13',
//   index: 0,
//   params: { id: '13' },
//   query: { foo: 'bar' }
// }
```

## Example Usage With Cloudflare Functions
```js
addEventListener('fetch', ({ request }) => router.handle(request))
```

## Testing & Contributing
1. fork repo
2. add code
3. run tests (and add your own) `yarn test`
4. submit PR
5. profit

## Entire Router Code (latest...)
```js
const { match } = require('path-to-regexp')

const Router = () => new Proxy({}, {
  get: (obj, prop) => prop === 'handle'
    ? (req) => {
      let { pathname: path, searchParams } = new URL(req.url)
      for (let [route, handler] of obj[req.method.toLowerCase()] || []) {
        if (hit = match(route, { decode: decodeURIComponent })(path)) {
          return handler({ 
            ...req,
            ...hit,
            path,
            query: Object.fromEntries(searchParams.entries()) 
          })
        }
      }
    } 
    : (path, handler) => { 
        obj[prop] 
        ? obj[prop].push([path, handler])
        : obj[prop] = [[path, handler]]
        return obj
      }
})
```
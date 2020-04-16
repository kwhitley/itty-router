# itty-router
It's an itty bitty router. That means small.  It's tiny.  For reals.|

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
- [ ] have a chainable interface!
- [ ] be tiny
- [ ] be easy to use/implement
- [ ] have as few dependencies as possible (or none)
- [ ] have test coverage
- [x] have a README
- [ ] have a way to release
- [ ] have pretty code
- [ ] handle all the basics of routing within a serverless function
- [ ] be platform agnostic (or handle the responses of the major platforms)

## Example
```js
import { Router } from 'itty-router'

const router = new Router()

// basic GET routs
router.get('/todos', async () => new Response('list of todos'))
router.get('/todos/:id', async ({ params }) => new Response(`details for todo #${params.id}`))

// plus DELETE, PATCH, PUT, POST, etc
router.post('/todos', async () => new Response('created a new todo!'))

// doesn't lose query params...
router.get('/search', async ({ query }) => new Response(JSON.stringify(query)) ?q=foo ---> { q: 'foo' }

// USE IT! (with some sort of event with request object on it)
// Example for CloudFlare Functions... warning this will definitely change.
addEventListener('fetch', router.handle(event))
```

## Testing & Contributing
1. fork repo
2. add code
3. run tests (and add your own) `yarn test`
4. submit PR
5. profit

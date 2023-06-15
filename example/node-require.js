const { createServerAdapter } = require('@whatwg-node/server')
const { createServer } = require('http')
require('isomorphic-fetch')
const { Router, error, json } = require('itty-router')

const router = Router()

router.get('/', () => 'Success!').all('*', () => error(404))

const ittyServer = createServerAdapter((...args) =>
  router
    .handle(...args)
    .then(json)
    .catch(error)
)

// Then use it in any environment
const httpServer = createServer(ittyServer)
httpServer.listen(3001)
console.log('listening at https://localhost:3001')

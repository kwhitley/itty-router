import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'http'
import 'isomorphic-fetch'
import { Router, error, json } from '../dist/index.js'

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

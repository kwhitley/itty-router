const { AutoRouter } = require('../../dist/AutoRouter')
const { createServerAdapter } = require('@whatwg-node/server')
const http = require('http')

const router = AutoRouter()

router.get('*', () => 'Hello itty-router v5')

const serverAdapter = createServerAdapter(router.fetch)

const httpServer = http.createServer(serverAdapter)

httpServer.listen(5000)

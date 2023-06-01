import express from 'express'
import { Router, error, json } from 'itty-router'
import 'isomorphic-fetch'

const app = express()

const router = Router()

router.get('/', () => 'Success!').all('*', () => error(404))

const handle = (request) => router.handle(request).then(json).catch(error)

app.use(handle)

app.listen(3001)
console.log('listening at https://localhost:3001')

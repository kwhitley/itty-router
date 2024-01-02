import { Router, error, json, text, withParams } from '../src'

const router = Router({ port: 3001 })
                .all('*', withParams)
                .get('/test', () => text('Success!'))
                .get('/foo/:bar/:baz?', ({ bar, baz }) => json(({ bar, baz })))
                .all('*', () => error(404))

export default router

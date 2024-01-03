import { Router, error, json, text, withParams, RouterOptions, RouterType } from '../src'

type CustomRouterType = RouterType & {
  addLogging: (logger: Function) => CustomRouterType
}

const router = Router({ port: 3001 })
                .all('*', withParams)
                .get('/test', () => text('Success!'))
                .get('/foo/:bar/:baz?', ({ bar, baz }) => json(({ bar, baz })))
                .all('*', () => error(404))

export default router

import 'isomorphic-fetch'
import { Router } from './Router'
import { json } from './json'
import { describe, it, expect, vi } from 'vitest'
import { flow } from './flow'

describe('flow(router: RouterType, options: FlowOptions): RequestHandler', () => {
  const router = Router()

  router
    .get('/', () => 'index')
    .get('/items', () => [])
    .get('/throw', (r) => r.a.b.c)

  it('should return a fully functional router.handle flow', async () => {
    let response = await flow(router)({ method: 'GET', url: 'https://foo.bar/' })
    expect(response.status).toBe(200)
  })

  it('uses a default formatter of json', async () => {
    let response = await flow(router)({ method: 'GET', url: 'https://foo.bar/index' }).then(r => r.json())
    console.log('response', response)
    expect(response).toEqual([])
  })
})

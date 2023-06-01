import 'isomorphic-fetch'
import { describe, expect, it } from 'vitest'
import { createResponse } from './createResponse'

// test each format type
import { json } from './json'
import { text } from './text'
import { html } from './html'
import { jpeg } from './jpeg'
import { png } from './png'
import { webp } from './webp'

describe('createResponse(mimeType: string, transform?: Function)', () => {
  it('can create custom response handlers', () => {
    const payload = { foo: 'bar' }
    const type = 'application/json; charset=utf-8'
    const customJSON = createResponse(type)

    const response = customJSON(payload)
    expect(response.headers.get('content-type')).toBe(type)
  })

  it('returned formatter with accept ResponseInit options, including headers', () => {
    const payload = { foo: 'bar' }
    const type = 'application/json; charset=utf-8'
    const fooHeader = 'bar'
    const json = createResponse(type)

    const response = json(payload, {
      headers: { fooHeader },
      status: 400,
    })

    expect(response.headers.get('fooHeader')).toBe(fooHeader)
    expect(response.status).toBe(400)
  })

  it('can pass in custom body transform function', async () => {
    const stars = createResponse('text/plain', (s) => s.replace(/./g, '*'))

    const response = stars('foo')
    const body = await response.text()

    expect(body).toBe('***')
  })

  it('will ignore a Response, to allow downstream use', async () => {
    const r1 = json({ foo: 'bar' })
    const r2 = json(r1)

    expect(r2).toBe(r1)
  })

  describe('format helpers', () => {
    const formats = [
      { name: 'json', fn: json, mime: 'application/json; charset=utf-8' },
      { name: 'text', fn: text, mime: 'text/plain' },
      { name: 'html', fn: html, mime: 'text/html' },
      { name: 'jpeg', fn: jpeg, mime: 'image/jpeg' },
      { name: 'png', fn: png, mime: 'image/png' },
      { name: 'webp', fn: webp, mime: 'image/webp' },
    ]

    for (const { name, fn, mime } of formats) {
      it(`${name}(body)`, async () => {
        const response = fn('foo')

        expect(response.headers.get('content-type')?.includes(mime)).toBe(true)
      })
    }
  })
})

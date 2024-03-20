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

  it('can pass in headers as Headers object', () => {
    const payload = { foo: 'bar' }
    const type = 'application/json; charset=utf-8'
    const json = createResponse(type)
    const headers = new Headers()
    headers.append('fooHeader', 'foo')

    const response = json(payload, {
      headers,
      status: 400,
    })

    expect(response.headers.get('fooHeader')).toBe('foo')
    expect(response.status).toBe(400)
  })

  it('can pass in custom body transform function', async () => {
    const stars = createResponse('text/plain', (s) => s.replace(/./g, '*'))

    const response = stars('foo')
    const body = await response.text()

    expect(body).toBe('***')
  })

  it('will ignore a Response, to allow downstream use (will not modify headers)', async () => {
    const r1 = json({ foo: 'bar' })
    const r2 = text(r1)

    expect(r2).toBe(r1)
    expect(r2.headers.get('content-type')?.includes('text')).toBe(false)
  })

  it('will ignore an undefined body', async () => {
    const r1 = json()
    const r2 = json(undefined)

    expect(r1).toBeUndefined()
    expect(r2).toBeUndefined()
  })

  it('will not apply a Request as 2nd options argument (using Request.url check method)', async () => {
    const request = new Request('http://foo.bar', { headers: { foo: 'bar' }})
    const response = json(1, request)
    // const { ...restCheck } = request

    // expect(restCheck.url).toBe('http://foo.bar/')
    // expect(request.url).toBe('http://foo.bar/')
    expect(response.headers.get('foo')).toBe(null)
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

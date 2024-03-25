import { StatusError } from 'StatusError'
import { IRequest } from './IttyRouter'

export type CorsOptions = {
  credentials?: true
  origin?: string | string[] | RegExp | ((origin: string) => boolean)
  maxAge?: number
  allowMethods?: string | string[]
  allowHeaders?: any
  exposeHeaders?: string | string[]
}

// Create CORS function with default options.
export const cors = (options: CorsOptions = {}) => {
  // Destructure and set defaults for options.
  const {
    origin = '*',
    credentials = false,
    allowMethods = ['*'],
    allowHeaders,
    exposeHeaders,
    maxAge,
  } = options

  // @ts-expect-error - this will be fine (ADD TESTS)
  const allowAll = origin.includes?.('*') || origin === '*'

  // create generic CORS headers
  const corsHeaders: Record<string, any> = {
    'access-control-allow-headers': allowHeaders?.join?.(',') ?? allowHeaders, // include allowed headers
    // @ts-ignore
    'access-control-expose-headers': exposeHeaders?.join?.(',') ?? exposeHeaders, // include allowed headers
    // @ts-ignore
    'access-control-allow-methods': allowMethods?.join?.(',') ?? allowMethods,  // include allowed methods
    'access-control-max-age': maxAge,
    'access-control-allow-credentials': credentials,
  }

  const getAccessControlOrigin = (request?: Request) => {
    const requestOrigin = request?.headers.get('origin') // may be null if no request passed

    return {
      // @ts-ignore
      'access-control-allow-origin': origin.test?.(requestOrigin)
      // @ts-ignore
        ?? origin.join?.(',')
        ?? origin instanceof Function
          // @ts-ignore
          ? origin(requestOrigin)
          : origin
    }
  }

  const preflight = (request: Request) => {
    if (request.method == 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: Object.entries({
          ...getAccessControlOrigin(request),
          ...corsHeaders,
        }).filter(v => v[1]),
      })
    } // otherwise ignore
  }

  const corsify = (response: Response, request?: Request) => {
    // check for no response?
    if (!(response instanceof Response))
      throw new Error('Corsify must receive a valid Response.')

    // ignore if already has CORS headers
    if (response?.headers?.get('access-control-allow-origin')) return response

    // Return new response with CORS headers.
    return new Response(response.body, {
      ...response,
      headers: Object.entries({
        ...getAccessControlOrigin(request),
        ...Object.fromEntries(response.headers),
        ...corsHeaders,
      }).filter(v => v[1]),
    })
  }

  // Return corsify and preflight methods.
  return { corsify, preflight }
}

import { StatusError } from 'StatusError'
import { IRequest } from './IttyRouter'

export type CorsOptions = {
  credentials?: boolean
  origin?: string | string[] | RegExp | ((origin: string) => boolean)
  maxAge?: number
  allowMethods?: string | string[]
  allowHeaders?: any
  exposeHeaders?: string | string[]
}

const AC_ALLOW_ORIGIN = 'access-control-allow-origin'

// Create CORS function with default options.
export const createCors = (options: CorsOptions = {}) => {
  // Destructure and set defaults for options.
  const {
    origin = '*',
    credentials = false,
    allowMethods = ['*'],
    allowHeaders,
    exposeHeaders,
    maxAge,
  } = options

  // const origin = options.origin // support either.  WASTED BYTES?

  const corsHeaders: Record<string, any> = {
    'access-control-allow-headers': allowHeaders?.join(',') ?? allowHeaders, // include allowed headers
    // @ts-ignore
    'access-control-expose-headers': exposeHeaders?.join(',') ?? exposeHeaders, // include allowed headers
    // @ts-ignore
    'access-control-allow-methods': allowMethods.join(',') ?? allowMethods,  // include allowed methods
    'access-control-max-age': maxAge,
    'access-control-allow-credentials': credentials,
  }

  const getAccessControlOrigin = (request?: Request) => {
    const requestOrigin = request?.headers.get('origin')

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
        headers: new Headers({
          ...getAccessControlOrigin(request),
          ...corsHeaders,
        }),
      })
    } // otherwise ignore
  }

  const corsify = (response: Response, request?: Request) => {
    // check for no response?
    if (!(response instanceof Response))
      throw new Error('Corsify must receive a valid Response.')

    // ignore if already ahs CORS headers
    if (response?.headers?.get(AC_ALLOW_ORIGIN)) return response

    // Return new response with CORS headers.
    return new Response(response.body, {
      ...response,
      headers: {
        ...getAccessControlOrigin(request),
        ...Object.fromEntries(response.headers),
        ...corsHeaders,
      },
    })
  }

  // Return corsify and preflight methods.
  return { corsify, preflight }
}

import { IRequest } from './Router'

interface CorsOptions {
  origins?: string[],
  maxAge?: number,
  methods?: string[],
  headers?: any,
}

// Create CORS function with default options.
export const createCors = (options: CorsOptions = {}) => {
  // Destructure and set defaults for options.
  const {
    origins = ['*'],
    maxAge,
    methods = ['GET'],
    headers = {}
  } = options

  let allowOrigin: any

  // Initial response headers.
  const rHeaders = {
    'content-type': 'application/json',
    'Access-Control-Allow-Methods': methods.join(', '),
    ...headers
  }

  // Set max age if provided.
  if (maxAge) rHeaders['Access-Control-Max-Age'] = maxAge

  // Pre-flight function.
  const preflight = (r: IRequest) => {
    // Use methods set.
    const useMethods = [...new Set(['OPTIONS', ...methods])]
    const origin = r.headers.get('origin') || ''

    // Set allowOrigin globally.
    allowOrigin = (origins.includes(origin) || origins.includes('*')) &&
      { 'Access-Control-Allow-Origin': origin }

    // Check if method is OPTIONS.
    if (r.method === 'OPTIONS') {
      const reqHeaders = {
        ...rHeaders,
        'Access-Control-Allow-Methods': useMethods.join(', '),
        'Access-Control-Allow-Headers': r.headers.get('Access-Control-Request-Headers'),
        ...allowOrigin
      }

      // Handle CORS pre-flight request.
      return new Response(null, {
        headers: r.headers.get('Origin') &&
          r.headers.get('Access-Control-Request-Method') &&
          r.headers.get('Access-Control-Request-Headers') ? reqHeaders : { Allow: useMethods.join(', '), }
      })
    }
  }

  // Corsify function.
  const corsify = (response: Response): Response => {
    if (!response) throw new Error('No fetch handler responded and no upstream to proxy to specified.')

    const { headers, status, body } = response

    // Bypass for protocol shifts or redirects, or if CORS is already set.
    if ([101, 301, 302, 308].includes(status) || headers.get('access-control-allow-origin')) return response

    // Return new response with CORS headers.
    return new Response(body, {
      status,
      headers: {
        ...Object.fromEntries(headers),
        ...rHeaders,
        ...allowOrigin,
        'content-type': headers.get('content-type'),
      }
    })
  }

  // Return corsify and preflight methods.
  return { corsify, preflight }
}

const withCors = (options = {}) => request => {
  const {
    origin = '*',
    methods = 'GET, POST, PATCH, DELETE',
    headers = 'authorization, referer, origin, content-type',
    credentials = false,
  } = options
  const referer = request.headers.get('Referer')
  const url = new URL(referer)
  const allowedOrigin = url.origin.match(/[^\w](slick\.af)|(localhost:3000)$/)
                      ? url.origin
                      : 'https://slick.af'
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': headers,
  }

  if (allowCredentials) {
    corsHeaders['Access-Control-Allow-Credentials'] = 'true'
  }

  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null
  ) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  // Handle standard OPTIONS request.
  return new Response(null, {
    headers: {
      'Allow': `${methods} , HEAD, OPTIONS`,
    }
  })
}

const addCorsHeaders = request => response => {
  let allowedOrigin = 'https://slick.af'
  const referer = request.headers.get('Referer')

  if (referer) {
    const url = new URL(referer)
    allowedOrigin = url.origin.match(/[^\w](slick\.af)|(localhost:3000)$/)
                  ? url.origin
                  : allowedOrigin
  }

  try {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  } catch (err) {
    // couldn't modify headers
  }

  return response
}

module.exports = { withCors }

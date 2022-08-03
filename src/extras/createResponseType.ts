export interface CreateResponseOptions {
  [key: string]: any
}

export const createResponseType = (
  format: string = 'text/plain; charset=utf-8',
) => (
  body: string | object,
  options: CreateResponseOptions = {},
) => {
  const { headers = {}, ...rest } = options

  if (typeof body === 'object') {
    return new Response(JSON.stringify(body), {
      headers: {
        'Content-Type': format,
        ...headers,
      },
      ...rest,
    })
  }

  return new Response(body, options)
}

export interface createResponseTypeOptions {
  stringify?: boolean
}

export interface CreateResponseOptions {
  headers?: HeadersInit
  [key: string]: any
}

export const createResponseType = (
  format: string = 'text/plain; charset=utf-8',
  options?: createResponseTypeOptions,
) => (
  body: any,
  options: CreateResponseOptions = {},
): Response => {
  const {
    headers = {},
    ...rest
  } = options

  if (options?.stringify) {
    body = JSON.stringify(body)
  }

  return new Response(body, {
    headers: {
      'Content-Type': format,
      ...headers,
    },
    ...rest,
  })
}

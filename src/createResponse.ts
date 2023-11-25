export interface ResponseFormatter {
  (body?: any, options?: ResponseInit): Response
}

export interface BodyTransformer {
  (body: any): string
}

export const createResponse =
  (
    format = 'text/plain; charset=utf-8',
    transform?: BodyTransformer
  ): ResponseFormatter =>
  (body, options?: ResponseInit) => {
    const { headers = {}, ...rest } = options || {}

    if (body?.constructor.name === 'Response') return body

    return new Response(transform ? transform(body) : body, {
      headers: {
        'content-type': format,
        ...headers,
      },
      ...rest,
    })
  }

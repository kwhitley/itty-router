export interface ResponseFormatter {
  (body?: any, options?: object): Response
}

export interface BodyTransformer {
  (body: any): string
}

type ResponseFormatterOptions = {
  headers?: object
} & ResponseInit

export const createResponse =
  (
    format = 'text/plain; charset=utf-8',
    transform?: BodyTransformer
  ): ResponseFormatter =>
  (body, options: ResponseFormatterOptions = {}) => {
    const { headers = {}, ...rest } = options

    if (body?.constructor.name === 'Response') return body

    return new Response(transform ? transform(body) : body, {
      headers: {
        'content-type': format,
        ...headers,
      },
      ...rest,
    })
  }

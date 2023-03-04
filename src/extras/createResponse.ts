export interface ResponseFormatter {
  (body?: any, options?: object): Response
}

type ResponseFormatterOptions = {
  headers?: object
} & ResponseInit

export const createResponse = (format: string = 'text/plain; charset=utf-8'): ResponseFormatter =>
  (body, options: ResponseFormatterOptions = {}) => {
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

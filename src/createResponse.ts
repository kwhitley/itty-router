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
  (body, { ...options } = {}) => {
    if (body === undefined || body instanceof Response) return body

    const response = new Response(transform?.(body) ?? body, options)
    response.headers.set('content-type', format)
    return response
  }

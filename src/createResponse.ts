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
  (body, { headers = {}, ...rest } = {}) =>
    body === undefined || body?.constructor.name === 'Response'
    ? body
    : new Response(transform ? transform(body) : body, {
                    headers: { 'content-type': format, ...headers },
                    ...rest
                  })

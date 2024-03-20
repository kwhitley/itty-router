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
  (body, { ...options } = {}) =>
    body === undefined || body instanceof Response // skip function if undefined or an existing Response
    ? body
    : new Response(transform ? transform(body) : body, {
                    ...options,
                    headers: {
                      'content-type': format,
                      ...options.headers?.entries
                          // @ts-expect-error - foul
                          ? Object.fromEntries(options.headers)
                          : options.headers
                    },
                  })

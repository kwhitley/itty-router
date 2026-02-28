import { ResponseFormatter } from './types'

 export const createResponse =
  (
    format = 'text/plain; charset=utf-8',
    transform?: (body: any) => any,
  ): ResponseFormatter =>
  // @ts-ignore
  (body, options = {}, response?) =>
    body === undefined || body instanceof Response ? body
    : (response = new Response(transform?.(body) ?? body, options.url ? undefined : options),
       response.headers.set('content-type', format),
       response)

import { json } from './json'

export interface ErrorFormatter {
  (status?: number, body?: string | object): Response
}

export const error: ErrorFormatter = (
  status = 500,
  body,
) => json({
  ...(typeof body === 'object'
    ? {
      status,
      ...body,
    }
    : {
        status,
        error: body,
      }),
}, { status })

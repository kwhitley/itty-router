import { json } from './json'

interface ErrorLike extends Error {
  status?: number
  [any: string]: any
}

export type ErrorBody = string | object

export interface ErrorFormatter {
  (statusCode?: number, body?: ErrorBody): Response
  (error: ErrorLike): Response
}

const getMessage = (code: number): string => ({
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
})[code] || 'Unknown Error'

export const error: ErrorFormatter = (a = 500, b?: ErrorBody) => {
  // handle passing an Error | StatusError directly in
  if (a instanceof Error) {
    const { message, ...err } = a
    a = a.status || 500
    b = {
      error: message || getMessage(a),
      ...err,
    }
  }

  b = {
    status: a,
    ...(typeof b === 'object' ? b : { error: b || getMessage(a) }),
  }

  return json(b, { status: a })
}

import { json } from './json'
import { status } from './status'

interface ErrorLike extends Error {
  status?: number,
  [any: string]: any,
}

export type ErrorBody = string | object

export interface ErrorFormatter {
  (statusCode?: number, body?: ErrorBody): Response
  (error: ErrorLike): Response
}

export const error: ErrorFormatter = (a = 500, b: ErrorBody = 'Internal Server Error') => {
  // handle passing an Error | StatusError directly in
  if (a instanceof Error) {
    const { message, ...err } = a
    b = { error: a.message, ...err }
    a = a.status || 500
  }

  b = {
    status: a,
    ...(typeof b === 'object' ? b : { error: b })
  }

  return json(b, { status: a })
}

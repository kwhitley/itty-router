import { json } from './json'
import { status } from './status'

interface ErrorLike extends Error {
  status?: number,
  [any: string]: any,
}

export type ErrorBody = string | object | Request

export interface ErrorFormatter {
  (statusCode?: number, body?: ErrorBody): Response
  (error: ErrorLike): Response
}

export const error: ErrorFormatter = (a = 500, b?: ErrorBody) => {
  // handle passing an Error | StatusError directly in
  if (a instanceof Error) {
    const { message, ...err } = a
    b = {
      error: a.message,
      ...err
    }
    return error(a.status || 500, b)
  }

  // return simple status code if no body or passed the raw Request
  if (!b || b?.constructor?.name === 'Request')
    return status(a)

  // otherwise return json
  return json({ status: a, ...(typeof b === 'object' ? b : { error: b }) }, { status: a })
}

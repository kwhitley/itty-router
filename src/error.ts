import { json } from './json'
import { ErrorFormatter } from './types'

const getMessage = (code: number): string => ({
  404: 'Not Found',
  500: 'Internal Server Error',
})[code]

export const error: ErrorFormatter = (a = 500, b?) => {
  // handle passing an Error | StatusError directly in
  if (a instanceof Error) { let e = a; a = (a as any).status || 500; b = { error: e.message || getMessage(a), ...e } }

  return json({
    status: a,
    ...(Object(b) === b ? b : { error: b || getMessage(a) }),
  }, { status: a })
}

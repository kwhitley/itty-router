import { json } from './json'
import { ErrorFormatter } from './types'

const getMessage = (code: number) => ({
  404: 'Not Found',
  500: 'Internal Server Error',
})[code]

export const error: ErrorFormatter = (a = 500, b?) => {
  // handle passing an Error | StatusError directly in
  if (a instanceof Error) { let e = a; a = (a as any).status || 500; b = { error: e.message || getMessage(a as number), ...e } }

  return json({
    status: a as number,
    ...(Object(b) === b ? b as object : { error: b || getMessage(a as number) }),
  }, { status: a as number })
}

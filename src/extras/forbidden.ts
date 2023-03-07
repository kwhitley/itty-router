import { error, ErrorBody } from './error'

export const forbidden = (v: ErrorBody = 'Forbidden') => error(403, v)

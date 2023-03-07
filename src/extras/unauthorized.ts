import { error, ErrorBody } from './error'

export const unauthorized = (v: ErrorBody = 'Unauthorized') => error(401, v)

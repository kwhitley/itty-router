import { error, ErrorBody } from './error'

export const notFound = (v: ErrorBody = 'Not Found') => error(404, v)

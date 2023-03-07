import { error, ErrorBody } from './error'

export const badRequest = (v: ErrorBody = 'Bad Request') => error(400, v)

import { error, ErrorBody } from './error'

export const badRequest = (v?: ErrorBody) => error(400, v)

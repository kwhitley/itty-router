import { error, ErrorBody } from './error'

export const unauthorized = (v?: ErrorBody) => error(401, v)

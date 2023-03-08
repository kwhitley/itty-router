import { error, ErrorBody } from './error'

export const forbidden = (v?: ErrorBody) => error(403, v)

import { error, ErrorBody } from './error'

export const notFound = (v?: ErrorBody) => error(404, v)

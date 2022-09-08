import { error } from './error'

export const missing = (
  message: string | object = 'Not found.'
) => error(404, message)

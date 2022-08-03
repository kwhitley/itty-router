import { error } from './error'

export const missing = (
  message: string = 'Not found.'
) => error(404, message)

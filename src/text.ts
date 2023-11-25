import { createResponse } from './createResponse'

export const text = createResponse(
  'text/plain; charset=utf-8',
  String
)

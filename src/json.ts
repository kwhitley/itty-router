import { createResponse } from './createResponse'

export const json = createResponse(
  'application/json; charset=utf-8',
  JSON.stringify
)

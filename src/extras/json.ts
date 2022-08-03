import { createResponseType } from './createResponseType'

export const json = createResponseType('application/json; charset=utf-8', {
  stringify: true,
})

json('OK')

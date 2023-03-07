import { error } from './error'
import { StatusError } from './StatusError'

export interface ErrorResponseHandler {
  (err: Error & StatusError): Response
}

export const respondWithError: ErrorResponseHandler =
  ({ status, name, message, ...rest }) =>
    error(status || 500, {
      error: message || rest.error,
      ...rest,
    })

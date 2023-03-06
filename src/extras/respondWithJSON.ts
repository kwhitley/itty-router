import { error } from './error'
import { StatusError } from './StatusError'
import { json } from './json'

export const respondWithJSON =
  (response: Response): Response =>
    response?.constructor?.name !== 'Response'
      ? json(response)
      : response

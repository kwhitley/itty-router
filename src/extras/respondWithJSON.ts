import { json } from './json'

export const respondWithJSON =
  (response: any): Response =>
    response?.constructor?.name !== 'Response'
      ? json(response)
      : response

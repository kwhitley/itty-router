import { json } from './json'

export interface ErrorFormatter {
  (status?: number, content?: string | object): Response
}

export const error: ErrorFormatter = (
  status = 500,
  content,
) => json({
  ...(typeof content === 'object'
    ? {
      status,
      ...content,
    }
    : {
        status,
        error: content,
      }),
}, { status })

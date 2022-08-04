import { json } from './json'

export const error = (
  status: number = 500,
  content: string | object = 'Internal Server Error.',
) => json(
  {
    ...(typeof content === 'object'
      ? content
      : {
          status,
          error: content,
        }),
  },
  { status },
)

// error(400) --> { status: 400 }
// error(400, 'Bad Request.') --> { status: 400, error: 'Bad Request.' }
// error(404, 'Not found.') --> { status: 404, error: 'Not found.' }

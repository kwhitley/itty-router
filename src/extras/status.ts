import { json } from './json'

export const status = (
  status: number,
  message?: string | object,
) =>
  message
  ? json({
      ...(typeof message === 'object'
        ? message
        : {
            status,
            message,
          }),
    }, { status })
  : new Response(null, { status })

  // status(200)
  // status(200, 'OK')
  // status(404, 'Not found.')
  // status(500, 'Internal Server Error.')
  // status({ status: 500, error: 'Internal Server Error.' })

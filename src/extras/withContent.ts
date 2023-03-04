import { IRequest } from 'itty-router'

// withContent - embeds any request body as request.content
export const withContent = async (request: IRequest): Promise<void> => {
  let contentType = request.headers.get('content-type')
  request.content = undefined

  try {
    if (contentType) {
      if (contentType.includes('application/json')) {
        request.content = await request.json()
      }

      if (['application/x-www-form-urlencoded', 'multipart/form-data'].includes(contentType)) {
        request.content = await request.formData()
      }
    }
  } catch (err) {} // silently fail on error
}

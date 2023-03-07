import { IRequest } from './Router'

// withContent - embeds any request body as request.content
export const withContent = async (request: IRequest): Promise<void> => {
  let contentType = request.headers.get('content-type')

  if (contentType?.includes('json'))
    request.content = await request.json()
}

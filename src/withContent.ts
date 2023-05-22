import { IRequest } from './Router'

// withContent - embeds any request body as request.content
export const withContent = async (request: IRequest): Promise<void> => {
  if (request.headers.get('content-type')?.includes('json'))
    request.content = await request.json()
}

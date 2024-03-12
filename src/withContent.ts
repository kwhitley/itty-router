import { IRequest, IRequestStrict } from './Router'
import { StatusError } from './StatusError'

export type HasContent<ContentType> = {
  content: ContentType
} & IRequestStrict

// withContent - embeds any request body as request.content
export const withContent = async (request: IRequest): Promise<void> => {
  if (request.headers.get('content-type')?.includes('json'))
    try {
      request.content = await request.json()
    } catch (e: unknown) {
      const se = e as SyntaxError
      throw new StatusError(400, se.message)
    }
}

import {IRequest, IRequestStrict} from './Router'

// withContent - embeds any request body as request.content
export const withContent = async (request: IRequest): Promise<void> => {
  if (request.headers.get('content-type')?.includes('json'))
    request.content = await request.json()
}

export type HasContent<ContentType> = {
  content: ContentType,
} & IRequestStrict

import { IRequest, IRequestStrict } from './IttyRouter'

export type HasContent<ContentType> = {
  content: ContentType
} & IRequestStrict

// withContent - embeds any request body as request.content
export const withContent = async (request: IRequest): Promise<void> => {
  request.content = request.body
    ? await request.clone().json()
        .catch(() => request.clone().formData())
        .catch(() => request.text())
    : undefined
}

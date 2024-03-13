import { IRequest, IRequestStrict } from './Router'

export type HasContent<ContentType> = {
  content: ContentType
} & IRequestStrict

// withContent - embeds any request body as request.content
export const withContent = async (request: IRequest): Promise<void> => {
  request.content = await request.clone().json()
                            .catch(() => request.clone().formData())
                            .catch(() => request.text())
}

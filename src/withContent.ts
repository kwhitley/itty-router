import { IRequest, IRequestStrict } from './Router'

export type HasContent<ContentType> = {
  content: ContentType
} & IRequestStrict

// withContent - embeds any request body as request.content
export const withContent = async (request: IRequest): Promise<void> => {
  console.log('request.formData is', request.formData)
  request.content = await request.clone().json()
                            .catch(e => request.clone().formData())
                            .catch(e => request.text())
}

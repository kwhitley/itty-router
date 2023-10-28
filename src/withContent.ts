import { IRequest, IRequestStrict } from './Router'

export type HasContent<ContentType> = {
  content: ContentType,
} & IRequestStrict

// withContent - embeds any request body as request.content
export const withContent = async (request: IRequest): Promise<void> => {
  const { headers } = request
  const type = headers.get('content-type')

  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(request)))

  request.content = type?.includes('json')
                  ? await request.json()
                  : type?.includes('form-urlencoded')
                    ? Object.fromEntries(new URLSearchParams(await request.text()))
                    : type?.includes('form-data')
                      ? await request.formData()
                      : type?.includes('text')
                        ? await request.text()
                        : undefined
}

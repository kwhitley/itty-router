type StatusErrorObject = {
  error?: string
  [key: string]: any
}

export class StatusError extends Error {
  [key: string]: any

  constructor(status = 500, body?: StatusErrorObject | string) {
    super(typeof body === 'object' ? body.error : body)
    if (typeof body === 'object') Object.assign(this, body)
    this.status = status
  }
}

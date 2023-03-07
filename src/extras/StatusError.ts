type StatusErrorObject = {
  error?: string,
  [key: string]: any
}

export class StatusError extends Error {
  status: number
  [key: string]: any

  constructor(status: number = 500, body?: StatusErrorObject | string) {
    if (typeof body === 'object') {
      super(body.error)
      Object.assign(this, body)
    } else {
      super(body)
    }

    this.status = status
  }
}

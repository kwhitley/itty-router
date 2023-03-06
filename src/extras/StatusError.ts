type StatusErrorObject = {
  message?: string,
  error?: string,
  [key: string]: any
}

export class StatusError extends Error {
  status: number
  [key: string]: any

  constructor(status: number = 500, body: StatusErrorObject | string = 'Internal Server Error') {
    if (typeof body === 'string') {
      super(body)
    } else {
      super(body.error || body.message)
      Object.assign(this, body)
    }

    this.name = 'StatusError'
    this.status = status
  }
}

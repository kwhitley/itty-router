export class StatusError extends Error {
  status: number

  constructor(status: number = 500, message: string = 'Internal Error.') {
    super(message)
    this.name = 'StatusError'
    this.status = status
  }
}

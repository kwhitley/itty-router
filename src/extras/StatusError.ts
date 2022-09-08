export interface StatusErrorType {
  status: number,
  message?: string,
}

export class StatusError extends Error implements StatusErrorType {
  status = 500

  constructor(
    status: number = 500,
    message: string = 'Internal Error.',
  ) {
    super(message)
    this.name = 'StatusError'
    this.status = status
  }
}

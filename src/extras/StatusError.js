class StatusError extends Error {
  constructor(status = 500, message = 'Internal Error.') {
    super(message)
    this.name = 'StatusError'
    this.status = status
  }
}

module.exports = { StatusError }

class MalformedBodyError extends Error {
  constructor(message) {
    message = message || "The body of the request is malformed."
    super(message)
    this.statusCode = 400
  }
}

class MalformedRequestError extends Error {
  constructor(message) {
    message = message || "The request is malformed (missing parameter etc.)."
    super(message)
    this.statusCode = 400
  }
}

class NotFoundError extends Error {
  constructor(message) {
    message = message || "Not found"
    super(message)
    this.statusCode = 404
  }
}

module.exports = {
  MalformedBodyError,
  MalformedRequestError,
  NotFoundError,
}

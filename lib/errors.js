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

module.exports = {
  MalformedBodyError,
  MalformedRequestError,
}

class MalformedData extends Error {
  constructor(message) {
    message = message || "The body or data parameter of the request is malformed."
    super(message)
    this.statusCode = 400
  }
}

class MalformedRequest extends Error {
  constructor(message) {
    message = message || "The request is malformed (missing parameter etc.)."
    super(message)
    this.statusCode = 400
  }
}

class NotFound extends Error {
  constructor(message) {
    message = message || "Not found"
    super(message)
    this.statusCode = 404
  }
}

module.exports = {
  MalformedData,
  MalformedRequest,
  NotFound,
}

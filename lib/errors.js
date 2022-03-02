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

// Does not derive from Error because we don't want stack but serialize
class ValidationError {
  constructor({ position, message, format, ...custom }) {
    format = format || "data"
    this.message = message || `Invalid ${format}`
    if (position !== undefined) this.position = position
    Object.assign(this, custom)
  }
}

export {
  MalformedRequest,
  NotFound,
  ValidationError,
}

export class APIError extends Error {
  constructor(message, code) {
    super(message)
    this.statusCode = code
  }
}

export class MalformedRequest extends APIError {
  constructor(message) {
    super(message || "The request is malformed (missing parameter etc.).", 400)
  }
}

export class NotFound extends Error {
  constructor(message) {
    super(message || "Not found", 404)
  }
}

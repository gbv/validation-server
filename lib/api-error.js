export class MalformedRequest extends Error {
  constructor(message) {
    super(message || "The request is malformed (missing parameter etc.).")
    this.code = 400
  }
}

export class NotFound extends Error {
  constructor(message) {
    super(message || "Not found")
    this.code = 404
  }
}

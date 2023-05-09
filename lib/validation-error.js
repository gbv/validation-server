// Does not derive from Error because we don't want stack trace but serialize
class ValidationError {
  constructor({ position, message, format, ...custom }) {
    format = format || "data"
    this.message = message || `Invalid ${format}`
    if (position !== undefined) this.position = position
    Object.assign(this, custom)
  }
}

// Put here to avoid dependency on Ajv libraries and to include missing keys
function fromAjvError(e) {
  const error = { message: e.message || "Validation with JSON Schema failed" }
  if (e.instancePath !== undefined) {
    error.position = {
      jsonpointer: e.instancePath,
    }
    // error.ajvDetails = e
  }
  if (e.keyword === "additionalProperties" && e.message) {
    error.message = `${e.message} '${e.params.additionalProperty}'`
  }
  return new ValidationError(error)
}

export {
  ValidationError,
  fromAjvError,
}

const { MalformedRequest, NotFound } = require("../lib/errors.js")

// TODO: check query parameters
// const versionPattern = /^[a-zA-Z0-9.-]+$/
// const formatPattern = /^[a-zA-Z0-9-]+$/

module.exports = (req, res, next) => {
  const { query } = req

  if (query.format) {
    const registry = req.app.get("formats")
    const format = registry.getSpecificFormat(query)
    if (format) {
      return format
    } else {
      next(new NotFound("Format not found"))
    }
  } else {
    next(new MalformedRequest("Missing query parameter: format"))
  }
}

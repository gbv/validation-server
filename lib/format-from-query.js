import { MalformedRequest, NotFound } from "../lib/errors.js"

// TODO: check query parameters
// const versionPattern = /^[a-zA-Z0-9.-]+$/
// const formatPattern = /^[a-zA-Z0-9-]+$/

export default async function (req) {
  const { query } = req

  if (query.format) {
    const registry = req.app.get("formats")
    const format = registry.getFormat(query)
    if (format) {
      return format
    } else {
      throw new NotFound("Format not found")
    }
  } else {
    throw new MalformedRequest("Missing query parameter: format")
  }
}

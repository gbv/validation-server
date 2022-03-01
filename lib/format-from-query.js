import { MalformedRequest, NotFound } from "../lib/errors.js"

// TODO: check query parameters
// const versionPattern = /^[a-zA-Z0-9.-]+$/
// const formatPattern = /^[a-zA-Z0-9-]+$/

// Get one format with one version based on query
export default async function (req) {
  const service = req.app.get("validationService")
  const { query } = req

  if (query.format) {
    if (!query.version) query.version = "default"
    const format = service.getFormat(query.format, query)
    if (format) {
      return format
    } else {
      throw new NotFound("Format not found")
    }
  } else {
    throw new MalformedRequest("Missing query parameter: format")
  }
}

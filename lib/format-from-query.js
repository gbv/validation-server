import { MalformedRequest, NotFound } from "../lib/errors.js"

const versionPattern = /^[a-zA-Z0-9.-]+$/
const formatPattern = /^[0-9a-z_/-]+/

// Get one format with one version based on query
export default async function (req) {
  const service = req.app.get("validationService")
  const { query } = req

  if (query.version) {
    if (!versionPattern.test(query.version)) {
      throw new MalformedRequest("Invalid query parameter: version")
    }
  } else {
    query.version = "default"
  }

  if (query.format) {
    if (!formatPattern.test(query.format)) {
      throw new MalformedRequest("Invalid query parameter: format")
    }
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

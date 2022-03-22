import { MalformedRequest, NotFound } from "../lib/errors.js"

const formatPattern = /^[0-9a-z_/-]+$/
const versionPattern = /^[a-zA-Z0-9.-]+$/
const formatWithVersionPattern = /^[0-9a-z_/-]+@[0-9a-z_/.-]+$/

// Request parameter possibly given by two ways
export function checkQueryValue(query, name, value="") {
  if ((value ?? "") !== "") {
    if ((query[name] ?? "") !== "" && query[name] !== value) {
      throw new MalformedRequest(`Query parameter mismatch: ${name}`)
    }
    query[name] = value
  }
}

// Get one format with one version based on query
export async function formatFromQuery(req) {
  const service = req.app.get("validationService")
  const { query } = req

  if (!query.format) {
    throw new MalformedRequest("Missing query parameter: format")
  }

  if (formatWithVersionPattern.test(query.format)) {
    const [ format, version ] = query.format.split("@")
    query.format = format
    checkQueryValue(query, "version", version)
  } else if (!formatPattern.test(query.format)) {
    throw new MalformedRequest("Invalid query parameter: format")
  }

  if (query.version) {
    if (!versionPattern.test(query.version)) {
      throw new MalformedRequest("Invalid query parameter: version")
    }
  } else {
    query.version = "default"
  }

  const format = service.getFormat(query.format, query)
  if (format) {
    return format
  } else {
    throw new NotFound("Format not found")
  }
}

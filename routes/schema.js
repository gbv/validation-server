import { formatFromQuery } from "../lib/query.js"
import knownFormats from "../lib/formats.js"

async function schemaRoute (req, res, next) {
  const service = req.app.get("validationService")

  return formatFromQuery(req) // reduces format to one schema at most
    .then(format => service.promiseSchema(format))
    .then(schema => {
      if (schema.file) {
        const headers = schema.file.metadata.headers || {}
        const validator = knownFormats[schema.type] /* c8 ignore next */ || {}
        headers["content-type"] = validator.mimetypes[0] || headers["content-type"] /* c8 ignore next */ || "text/plain"
        res.sendFile(schema.file.path, { headers })
      } else {
        res.set("content-type", "text/plain")
        res.send(schema.value)
      }

    })
    .catch(e => next(e))
}

export default schemaRoute

import { NotFound } from "../lib/errors.js"
import formatFromQuery from "../lib/format-from-query.js"
import knownFormats from "../lib/formats.js"

async function schemaRoute (req, res, next) {
  const { query } = req
  if (!query.version) query.version = "default"

  return formatFromQuery(req)
    .then(async format => {
      const versions = Object.values(format.versions || {}).filter(v => v.schemas)
      if (versions.length) {
        const schema = versions[0].schemas[0]
        if (schema.url) {
          // TODO: move to service object?
          const service = req.app.get("validationService")
          const entry = await service.cache.get(schema.url)
          if (!entry) {
            throw new NotFound("Schema file not found")
          }
          const headers = entry.metadata.headers || {}
          const validator = knownFormats[schema.type] || {}
          headers["content-type"] = validator.mimetype || headers["content-type"] || "text/plain"
          res.sendFile(entry.path, { headers })
        } else {
          res.set("content-type", "text/plain")
          res.send(schema.value)
        }
      } else {
        throw new NotFound(`Format ${format.id} has no schemas`)
      }
    })
    .catch(e => next(e))
}

export default schemaRoute

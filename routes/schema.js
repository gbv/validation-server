import { NotFound } from "../lib/errors.js"
import formatFromQuery from "../lib/format-from-query.js"
import validators from "../lib/validators.js"

async function schemaRoute (req, res, next) {
  return formatFromQuery(req)
    .then(async format => {
      if (format && format.schemas && format.schemas.length) {
        const schema = format.schemas[0]
        if (schema.url) {
          const entry = await req.app.get("schemaCache").get(schema.url)
          if (!entry) {
            console.log("SChema not found: ", schema.url)
            throw new NotFound("Schema file not found")
          }
          const headers = entry.metadata.headers || {}
          const validator = validators[schema.type] || {}
          headers["content-type"] = validator.mimetype || headers["content-type"] || "text/plain"
          res.sendFile(entry.path, { headers })
        } else {
          res.set("content-type", "text/plain")
          res.send(schema.value)
        }
      } else {
        throw new NotFound("Schema not found")
      }
    })
    .catch(e => next(e))
}

export default schemaRoute

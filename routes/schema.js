import { NotFound } from "../lib/errors.js"
import validators from "../lib/validators.js"
import formatFromQuery from "../lib/format-from-query.js"

async function schemaRoute (req, res, next) {
  req.query.withFile = true

  const formatsDirectory = req.app.get("formatsDirectory")

  return formatFromQuery(req)
    .then(format => {
      if (format && format.schemas && format.schemas.length) {
        const { file, type } = format.schemas[0]

        const headers = { "Content-Type": validators[type].mimetype }
        res.sendFile(file, { headers, root: formatsDirectory })
      } else {
        throw new NotFound("Schema not found")
      }
    })
    .catch(e => next(e))
}

export default schemaRoute

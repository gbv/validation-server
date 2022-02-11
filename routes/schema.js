const { NotFound } = require("../lib/errors.js")
const validators = require("../lib/validators.js")
const config = require("../config")
const formatFromQuery = require("../lib/format-from-query.js")

module.exports = async (req, res, next) => {
  req.query.withFile = true

  return formatFromQuery(req)
    .then(format => {
      if (format && format.schemas && format.schemas.length) {
        const { file, type } = format.schemas[0]

        const headers = { "Content-Type": validators[type].mimetype }
        res.sendFile(file, { headers, root: config.formatsDirectory })
      } else {
        throw new NotFound("Schema not found")
      }
    })
    .catch(e => next(e))
}

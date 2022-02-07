const { NotFound } = require("../lib/errors.js")
const validators = require("../lib/validators.js")
const config = require("../config")
const formatFromQuery = require("../lib/format-from-query.js")

module.exports = (req, res, next) => {
  req.query.withFile = true
  const format = formatFromQuery(req, res, next)
  if (format && format.schemas && format.schemas.length) {
    const { file, type } = format.schemas[0]

    const headers = { "Content-Type": validators[type].contentType }
    res.sendFile(file, { headers, root: config.formatsDirectory })
  } else {
    next(new NotFound("Schema not found"))
  }
}

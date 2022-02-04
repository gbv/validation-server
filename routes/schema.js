const querySpecificFormat = require("../lib/query-specific.js")
const { NotFound } = require("../lib/errors.js")
const validators = require("../lib/validators.js")
const config = require("../config")

module.exports = (req, res, next) => {
  req.query.withFile = true
  const format = querySpecificFormat(req, res, next)
  if (format && format.schemas && format.schemas.length) {
    const { file, type } = format.schemas[0]

    const headers = { "Content-Type": validators[type].contentType }
    res.sendFile(file, { headers, root: config.baseDirectory })
  } else {
    next(new NotFound("Schema not found"))
  }
}

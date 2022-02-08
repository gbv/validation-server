const express = require("express")
const router = express.Router()
const axios = require("axios")
const { MalformedRequest } = require("../lib/errors.js")
const config = require("../config")
const { URL } = require("url")

const parsers = require("../lib/parsers.js")
const formatFromQuery = require("../lib/format-from-query.js")

async function validate(data, format) {
  const { id, base, schemas } = format

  // Just use a parser for validating
  if (id in parsers) {
    return parsers[id].parse(data)
      .then(result => result.map(() => true))
      .catch(e => [[e]])
  }

  if (base === "json") {
    // TODO: what if multiple schemas exist?
    const schema = schemas ? schemas[0] : null

    if (schema && schema.validator) {
      const { validator } = schema
      return await parsers.json.parse(data)
        .then(data => data.map(record => validator(record) ? true : validator.errors))
        .catch(e => [[e]])
    } else {
      throw new Error(`No schema available to validate ${id}`)
    }

  } else {
    throw new Error(`Validation of ${base} based formats is not supported`)
  }
}

async function validateRoute(req, res, next) {
  const format = formatFromQuery(req, res, next)
  return validate(req.query.data, format)
    .then(result => res.send(result))
    .catch(error => next(error))
}

// HTTP POST
router.post("/",
  async (req, res, next) => {
    req.query.data = req.body
    validateRoute(req, res, next)
  },
)

// HTTP GET
router.get("/", async (req, res, next) => {
  const { query } = req

  if (query.url) {
    // Get data from URL
    try {
      const url = new URL(query.url)

      const { data, headers } = await axios.get(url.toString())

      var format
      if (typeof data === "object") {
        format = "json"
      } else {
        const formats = req.app.get("formats")
        const contentType = headers["content-type"]
        if (formats) {
          format = formats.guessFromContentType(contentType)
        }
      }

      if (format && !query.format) {
        query.format = format
      }
      query.data = data

      config.log(`Got ${format} from ${url}`)
    } catch(e) {
      if(e instanceof TypeError) {
        next(new MalformedRequest("malformed query parameter: url"))
      } else {
        next(new Error("requesting data from url failed!"))
      }
      return
    }
  } else if (!query.data) {
    next(new MalformedRequest("Please use HTTP POST or provide query parameter 'url' or 'data'!"))
    return
  }

  validateRoute(req, res, next)
})

module.exports = router

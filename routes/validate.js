const express = require("express")
const router = express.Router()
const axios = require("axios")
const { MalformedRequest, MalformedConfiguration } = require("../lib/errors.js")
const config = require("../config")
const { URL } = require("url")

const parsers = require("../lib/parsers.js")
const formatFromQuery = require("../lib/format-from-query.js")

async function validate(data, format) {
  const { id, schemas } = format

  // TODO: take into account base format

  // Just use a parser for validating (TODO: move to formats object)
  if (id in parsers) {
    return parsers[id].parse(data)
      .then(result => result.map(() => true))
      .catch(e => [[e]])
  }

  // TODO: what if multiple schemas exist?
  const schema = schemas ? schemas[0] : null

  if (schema && schema.validator) {
    const { validator } = schema
    return await parsers.json.parse(data)
      .then(data => data.map(record => validator(record) ? true : validator.errors))
      .catch(e => [[e]])
  } else {
    throw new MalformedConfiguration(`No schema or parser available to validate ${id}`)
  }
}

async function validateRoute(req, res, next) {
  formatFromQuery(req)
    .then(format => validate(req.query.data, format))
    .then(result => res.send(result))
    .catch(error => next(error))
}

// HTTP POST
router.post("/",
  async (req, res, next) => {
    if (req.rawBody) {
      req.query.data = req.rawBody
    } else {
      next(new MalformedRequest("Missing HTTP POST request body!"))
    }
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
        const mimetype = headers["content-type"]
        if (formats) {
          format = formats.guessFromContentType(mimetype)
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

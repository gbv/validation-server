const express = require("express")
const router = express.Router()
const axios = require("axios")
const { MalformedRequest, NotFound } = require("../lib/errors.js")
const config = require("../config")
const { URL } = require("url")

async function validateHandler(req, res, next) {
  const { query } = req

  if (!query.format) {
    return next(new MalformedRequest("Missing query parameter: format"))
  }

  const formats = req.app.get("formats")

  if (!query.version) {
    query.version = "default"
  }
  const selectedFormats = formats.getFormats(query)

  if (!selectedFormats.length) {
    return next(new NotFound("Format not found"))
  }

  const { id, base, schemas } = selectedFormats[0]
  var result = []

  if (id === "json") {
    if (typeof query.data === "object") {
      result = [true]
    } else {
      try {
        const data = JSON.parse(query.data)
        result = Array.isArray(data) ? data.map(() => true) : [true]
      } catch(e) {
        result = [{
          error: "SyntaxError",
          message: e.message || "Failed to parse JSON data",
        }]
      }
    }

  } else if (base === "json") {
    var data = query.data
    if (typeof data !== "object") {
      try {
        data = JSON.parse(data)
        data = Array.isArray(data) ? data : [data]
      } catch(e) {
        result = [{
          error: "SyntaxError",
          message: e.message || "Failed to parse JSON data",
        }]
        res.send(result)
        return
      }
    }

    // TODO: what if multiple schemas exist?
    const schema = schemas ? schemas[0] : null

    result = data.map(record => {
      if (schema && schema.validator) {
        const { validator } = schema
        if (validator(record)) {
          return true
        } else {
          return validator.errors
        }
      } else {
        // TODO: better return error if no schema available?
        return null // unknown
      }
    })

  } else {
    result = [undefined]
  }

  res.send(result)
}

// HTTP POST
router.post("/",
  async (req, res, next) => {
    req.query.data = req.body
    validateHandler(req, res, next)
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

  validateHandler(req, res, next)
})

module.exports = router

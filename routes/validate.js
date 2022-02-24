import express from "express"
const router = express.Router()

import { MalformedRequest, MalformedConfiguration } from "../lib/errors.js"
import { URL } from "url"
import fetch from "node-fetch"

import knownFormats from "../lib/formats.js"
import formatFromQuery from "../lib/format-from-query.js"

function validate(data, format) {
  if (format.validate) {
    // TODO: move logic into format.valid method?

    // format can have exactely one schema that is used for validation
    const schema = Object.values(format.versions || {}).map(v => (v.schemas||[])[0])[0]

    var base = (schema && schema.type in knownFormats)
      ? knownFormats[schema.type].restricts : null
    if (!Array.isArray(base)) base = [base]

    if (base.find(b => b === "json")) {
      data = knownFormats.json.parse(data)
      if (!Array.isArray(data)) {
        data = [ data ]
      }
    } else {
      data = [ data ]
    }

    return data.map(record => format.validate(record) || true)
  } else {
    throw new MalformedConfiguration(`No schema or parser available to validate ${format.id}`)
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
  const service = req.app.get("validationService")
  const { query } = req

  if (query.url) {
    // Get data from URL
    try {
      const url = new URL(query.url)
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error()

      query.data = res.text()
      const type = res.headers.get("content-type")
      const format = service.guessFromContentType(type)
      if (format && !query.format) {
        query.format = format
      }
    } catch(e) {
      if (e instanceof TypeError) {
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

export default router

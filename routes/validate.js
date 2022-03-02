import express from "express"
const router = express.Router()

import { MalformedRequest } from "../lib/errors.js"
import { URL } from "url"
import fetch from "node-fetch"

import knownFormats from "../lib/formats.js"
import formatFromQuery from "../lib/format-from-query.js"
import { jsonPathQuery } from "../lib/source.js"

function validate(data, format, select) {
  // TODO: move logic into format.validateAll method?
  // TODO: only when data is string

  // format can have exactely one schema that is used for validation
  const schema = Object.values(format.versions || {}).map(v => (v.schemas||[])[0])[0]

  var base = (schema && schema.type in knownFormats)
    ? knownFormats[schema.type].restricts : null
  if (!Array.isArray(base)) base = [base]

  if (base.find(b => b === "json")) {
    data = knownFormats.json.parse(data)
    try {
      data = jsonPathQuery(data, select || "$")
    } catch(e) {
      throw new MalformedRequest("Malformed query parameter: select")
    }
  } else {
    data = [data]
  }

  return data.map(record => format.validate(record) || true)
}

// HTTP GET
async function prepareGetData(req) {
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
        throw new MalformedRequest("malformed query parameter: url")
      } else {
        throw new Error("requesting data from url failed!")
      }
    }
  } else if (!query.data) {
    throw new MalformedRequest("Please use HTTP POST or provide query parameter 'url' or 'data'")
  }
}

router.get("/validate", async (req, res, next) => {
  prepareGetData(req)
    .then(() => formatFromQuery(req))
    .then(format => validate(req.query.data, format, req.query.select))
    .then(result => res.send(result))
    .catch(error => next(error))
})

router.post("/:format([0-9a-z_/-]+)", async (req, res, next) => {
  req.query.format = req.params.format
  req.url = "/"
  next()
})

router.post("/", async (req, res, next) => {
  formatFromQuery(req)
    .then(format => {
      if (req.rawBody) {
        return validate(req.rawBody, format, req.query.select)
      } else {
        throw new MalformedRequest("Missing HTTP POST request body")
      }
    })
    .then(result => res.send(result))
    .catch(error => next(error))
})

export default router

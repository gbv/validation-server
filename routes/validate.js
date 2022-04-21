import express from "express"
const router = express.Router()

import { URL } from "url"
import axios from "axios"
import bytes from "bytes"

import { MalformedRequest } from "../lib/errors.js"
import { checkQueryValue, formatFromQuery } from "../lib/query.js"

// HTTP GET
async function prepareGetData(req) {
  const service = req.app.get("validationService")
  const config = req.app.get("validationConfig")
  const { timeout } = config
  const maxBodyLength = bytes.parse(config.limit)

  const { query } = req

  if (query.url) {
    // Get data from URL
    try {
      const url = new URL(query.url)

      const res = await axios.get(url.toString(), {
        maxBodyLength,
        timeout,
        responseType: "text",
      })

      query.data = res.data

      const type = res.headers["content-type"]
      query.format = query.format || service.guessFromContentType(type)

      // TODO: guess encoding from filename and/or content type?

    } catch(e) {
      if (e instanceof TypeError) {
        throw new MalformedRequest("Malformed query parameter: url")
      } else {
        throw new Error("Requesting data from url failed!")
      }
    }
  } else if (!query.data) {
    throw new MalformedRequest("Please use HTTP POST or provide query parameter 'url' or 'data'")
  }
}

router.get("/validate", async (req, res, next) => {
  prepareGetData(req)
    .then(() => formatFromQuery(req))
    .then(format => validateAction(format, req))
    .then(result => res.send(result))
    .catch(error => next(error))
})

router.post("/:format([0-9a-z_/-]+)@:version([0-9a-z_/.-]+)", async (req, res, next) => {
  req.query.version = req.params.version
  req.url = `/${req.params.format}`
  next()
})

router.post("/:format([0-9a-z_/-]+)", async (req, res, next) => {
  req.query.format = req.params.format
  req.url = "/"
  next()
})

function validateAction(format, req) {
  var { data, select, encoding } = req.query
  if (encoding) {
    const service = req.app.get("validationService")
    const encodingFormat = service.getEncoding(encoding, format.id)
    if (encoding === "ndjson" || encoding === "yaml") {
      // TODO: what if select is already set?
      select = "$.*"
    }
    try {
      data = encodingFormat.parse(data)
    } catch (e) {
      return [[e]]
    }
  }
  return format.validateAll(data, { select })
}

router.post("/", async (req, res, next) => {
  // from multipart
  if (req.body && !(req.body instanceof Buffer)) {
    if (req.file) {
      req.rawBody = req.file.buffer.toString()
      // TODO: guess format from file.originalname or file.mimetype
    } else {
      req.rawBody = req.body.data
    }
    try {
      checkQueryValue(req.query, "format", req.body.format)
      checkQueryValue(req.query, "version", req.body.version)
    } catch(e) {
      next(e)
    }
    req.query.type = req.body.type
    req.query.select = req.body.select
    req.query.as = req.body.as
  }
  formatFromQuery(req)
    .then(format => {
      if (req.rawBody) {
        req.query.data = req.rawBody
        return validateAction(format, req)
      } else {
        throw new MalformedRequest("Missing HTTP POST request body")
      }
    })
    .then(result => res.send(result))
    .catch(error => next(error))
})

export default router

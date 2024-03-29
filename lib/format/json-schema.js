import fs from "fs/promises"
import Ajv from "ajv"

// add formats
import ajvFormats from "ajv-formats"
import ajvFormats2019 from "ajv-formats-draft2019"

// support draft-06 as well
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const draft6MetaSchema = require("ajv/dist/refs/json-schema-draft-06.json")

import migrateSchema from "json-schema-migrate"

import { fromAjvError } from "../validation-error.js"
import json from "../format/json.js"

// FIXME: making this global is violation of abstraction
var globalCache
var ajv
async function loadSchema(uri) {
  return globalCache.fetch(uri)
    .then(({path}) => fs.readFile(path).then(content => JSON.parse(content)))
}

// Compiles a JSON Schema file into a validator function.
// May throw an error
async function createValidator({ url, value, cache, logger, allErrors }) {

  // TODO: cache ajv instances with same cache and logger
  // if (!ajv) {
  globalCache = cache
  const options = {
    addUsedSchema: false,
    allowUnionTypes: true,
    strictSchema: false, // allow unknown keywords, required for some draft-04 schemas
    allErrors,
    loadSchema,
  }
  logger.debug("Initializing ajv")
  options.logger = logger

  ajv = new Ajv(options)
  ajvFormats(ajv)
  ajvFormats2019(ajv)
  ajv.addMetaSchema(draft6MetaSchema)
  // }

  var schema = typeof value === "string" ? JSON.parse(value) : (value || await loadSchema(url))

  const version = schema["$schema"]
  if (version === "http://json-schema.org/draft-04/schema#") {
    migrateSchema.draft7(schema)
    logger.info(`Upgraded JSON Schema draft-04: ${url}`)
  }

  // this call takes most of the time. TODO: load compiled from cache?
  const validator = cache ? await ajv.compileAsync(schema) : ajv.compile(schema)

  // FIXME: could also return a sync validator
  return (async (data, options = {}) => {
    return json.validateWith(data, options.select, parts => {
      // map validation errors to common validation error format
      return parts.map(record => {
        if (validator(record)) {
          return true
        } else {
          return validator.errors.map(e => fromAjvError(e))
        }
      })
    })
  })
}

export default {
  title: "JSON Schema",
  base: "json", // is a JSON format
  restricts: "json",  // can validate JSON based formats
  mimetypes: ["application/json"],
  url: "https://json-schema.org/",
  description: "Most common schema language for JSON",
  versions: {
    "draft-07": {
      schemas: [ {
        url: "https://json-schema.org/draft-07/schema",
        type: "json-schema",
      } ],
    },
    "draft-06": {
      schemas: [ {
        url: "https://json-schema.org/draft-06/schema",
        type: "json-schema",
      } ],
    },
    "draft-04": {
      schemas: [ {
        url: "https://json-schema.org/draft-04/schema",
        type: "json-schema",
      } ],
    },
  },
  createValidator,
}

import fs from "fs/promises"
import Ajv from "ajv"

import { stringData } from "../source.js"
const readJSON = async file => fs.readFile(file).then(content => JSON.parse(content))

// add formats
import ajvFormats from "ajv-formats"
import ajvFormats2019 from "ajv-formats-draft2019"

// support draft-06 as well
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const draft6MetaSchema = require("ajv/dist/refs/json-schema-draft-06.json")

import migrateSchema from "json-schema-migrate"

import { ValidationError } from "../errors.js"

// FIXME: making this global is violation of abstraction
var globalCache
var ajv
async function loadSchema(uri) {
  return globalCache.fetch(uri).then(({path}) => readJSON(path))
}


// Compiles a JSON Schema file into a validator function.
// May throw an error
export default async function createValidator({ url, value, cache, logger }) {

  // TODO: cache ajv instances with same cache and logger
  //  if (!ajv) {
  globalCache = cache
  const options = {
    addUsedSchema: false,
    allowUnionTypes: true,
    strictSchema: false, // allow unknown keywords, required for some draft-04 schemas
    loadSchema,
  }
  logger.debug("Initializing ajv")
  options.logger = logger

  ajv = new Ajv(options)
  ajvFormats(ajv)
  ajvFormats2019(ajv)
  ajv.addMetaSchema(draft6MetaSchema)
  //  }

  var schema = typeof value === "string" ? JSON.parse(value) : (value || await loadSchema(url))

  const version = schema["$schema"]
  if (version === "http://json-schema.org/draft-04/schema#") {
    migrateSchema.draft7(schema)
    logger.info(`Upgraded JSON Schema draft-04: ${url}`)
  }

  const validator = cache ? await ajv.compileAsync(schema) : ajv.compile(schema)

  // map validation errors to common validation error format
  return (data => {
    data = stringData(data)
    if (validator(data)) {
      return null
    } else {
      return validator.errors.map(e => {
        return new ValidationError({
          message: e.message || "Validation with JSON Schema failed",
          position: {
            jsonpointer: e.instancePath,
          },
        // ajvDetails: e
        })
      })
    }
  })
}

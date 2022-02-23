import fs from "fs/promises"
import Ajv from "ajv"

const readJSON = async file => fs.readFile(file).then(content => JSON.parse(content))

// making this global is violation of abstraction but otherwise we'd multiply Ajv instances
var globalCache
async function loadSchema(uri) {
  return globalCache.fetch(uri).then(({path}) => readJSON(path))
}

const ajv = new Ajv({
  addUsedSchema: false,
  allowUnionTypes: true,
  strictSchema: false, // allow unknown keywords, required for some draft-04 schemas
  loadSchema,
})

// add formats
import ajvFormats from "ajv-formats"
import ajvFormats2019 from "ajv-formats-draft2019"
ajvFormats(ajv)
ajvFormats2019(ajv)

// support draft-06 as well
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const draft6MetaSchema = require("ajv/dist/refs/json-schema-draft-06.json")
ajv.addMetaSchema(draft6MetaSchema)

import migrateSchema from "json-schema-migrate"

import { ValidationError } from "../errors.js"

// Compiles a JSON Schema file into a validator function.
// May throw an error
export default async function createValidator({ url, value, cache }) {
  globalCache = cache

  const schema = value || await loadSchema(url)

  const version = schema["$schema"]
  if (version === "http://json-schema.org/draft-04/schema#") {
    migrateSchema.draft7(schema)
    // console.log(`Compiling upgraded JSON Schema draft-04: ${url}`)
  }

  const validator = cache ? await ajv.compileAsync(schema) : ajv.compile(schema)

  // map validation errors to common validation error format
  return (data => {
    if (validator(data)) {
      return null
    } else {
      return validator.errors.map(e => {
        return new ValidationError({
          message: e.message || "Validation with JSON Schema failed",
          position: e.instancePath,
          positionFormat: "jsonpointer",
        // ajvDetails: e
        })
      })
    }
  })
}

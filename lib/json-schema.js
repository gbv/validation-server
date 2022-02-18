import fs from "fs"
import Ajv from "ajv"

const ajv = new Ajv({
  addUsedSchema: false,
  allowUnionTypes: true,
  strictSchema: false, // allow unknown keywords, required for some draft-04 schemas
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

import { ValidationError } from "./errors.js"

// Compiles a JSON Schema file into a validator function.
// May throw an error
export default function createValidator(file) {
  var schema = JSON.parse(fs.readFileSync(file))

  const version = schema["$schema"]
  if (version === "http://json-schema.org/draft-04/schema#") {
    migrateSchema.draft7(schema)
    // config.log("Internally upgrading JSON Schema draft-04")
  }

  // schema $id must be unique (TODO: check against file index?)
  var validator
  try {
    validator = ajv.compile(schema)
  } catch(e) {
    throw new Error(`Failed to compile schema from ${file}`)
  }

  // map validation errors to common validation error format
  const mappedValidator = data => {
    const ok = validator(data)
    mappedValidator.errors = (validator.errors||[]).map(e => {
      return new ValidationError({
        message: e.message || "Validation with JSON Schema failed",
        position: e.instancePath,
        positionFormat: "jsonpointer",
        // ajvDetails: e
      })
    })
    return ok
  }

  return mappedValidator
}

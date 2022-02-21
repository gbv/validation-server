import fs from "fs"
import Ajv from "ajv"
import { URL } from "url"
import path from "path"

const schemaFileCache = {}  // uri => raw JSON
const schemaLocations = {}  // uri base => local directory
const pathPattern = new RegExp("(.*/)([^/]+\\.json)$")

function rememberSchema(schema, file) {
  if ("$id" in schema) {
    const uri = new URL(schema["$id"]) // will die if no absolute URL!
    schemaFileCache[uri] = schema
    const uripath = pathPattern.exec(uri.pathname)
    if (uripath) {
      uri.pathname = uripath[1]
      const directory = path.dirname(file)
      if (schemaLocations[uri] !== directory) {
        schemaLocations[uri] = directory
        console.log(`Schemas at ${uri} are located at ${directory}`)
      } else if (schemaLocations[uri]) {
        console.warn(`Schemas at ${uri} already located at ${directory}`)
      }
    }
  } else {
    console.warn(`Missing $id of JSON Schema ${file}`)
  }
}

async function loadSchema(uri) {
  if (uri in schemaFileCache) {
    return schemaFileCache[uri]
  }

  uri = new URL(uri)
  const uripath = pathPattern.exec(uri.pathname)
  if (uripath) {
    uri.pathname = uripath[1]
    const directory = schemaLocations[uri]
    if (directory) {
      const file = path.resolve(directory, uripath[2])
      // console.log(file)
      const schema = JSON.parse(fs.readFileSync(file))
      rememberSchema(schema, file)
      return schema
    }
  }

  const msg = `Failed to load schema from URI ${uri}`
  console.error(msg)
  throw new Error(msg)
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
export default async function createValidator(file) {

  const schema = JSON.parse(fs.readFileSync(file))
  const version = schema["$schema"]
  if (version === "http://json-schema.org/draft-04/schema#") {
    migrateSchema.draft7(schema)
    // console.log(`Compiling upgraded JSON Schema draft-04: ${file}`)
  } else {
    // console.log(`Compiling JSON Schema ${file}`)
  }

  rememberSchema(schema, file)

  const validator = await ajv.compileAsync(schema)

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

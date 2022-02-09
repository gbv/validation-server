const fs = require("fs")
const Ajv = require("ajv")
const addFormats = require("ajv-formats")
const ajv = new Ajv({ addUsedSchema: false, allowUnionTypes: true })
addFormats(ajv)

// support draft-06 as well
const draft6MetaSchema = require("ajv/dist/refs/json-schema-draft-06.json")
ajv.addMetaSchema(draft6MetaSchema)

const { ValidationError } = require("./errors.js")

module.exports = {

  "json-schema": {
    id: "schema/json-schema",
    title: "JSON Schema",
    base: "json", // is a JSON format
    for: "json",  // can validate JSON based formats
    contentType: "application/json",
    filename: "schema.json",
    schemas: [
      {
        version: "draft-07",
        url: "https://json-schema.org/draft-07/schema",
        type: "json-schema",
      },
      {
        version: "draft-06",
        url: "https://json-schema.org/draft-07/schema",
        type: "json-schema",
      },
    ],
    buildValidator(schemaFile) {
      // TODO: compilation may fail. Better use a promise instead?
      const schemaData = JSON.parse(fs.readFileSync(schemaFile))
      // schema $id must be unique (TODO: check against file?)
      const validator = ajv.compile(schemaData)
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
    },
  },

  /*
  xsd: {
    id: "schema/xsd",
    title: "XML Schema",
    base: "xml", // is an XML format
    for: "xml",  // can validate XML based formats
    contentType: "text/xml",
    filename: "schema.xsd",
    // buildValidator(schemaFile) {
    //  const xsdValidator = require('xsd-schema-validator')
    //
    // TODO
    // }
  },
  */
}

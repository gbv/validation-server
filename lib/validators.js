const fs = require("fs")
const Ajv = require("ajv")
const addFormats = require("ajv-formats")
const ajv = new Ajv({ addUsedSchema: false }) // schema $id must be unique (TODO: check against file)
addFormats(ajv)

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
    ],
    buildValidator(schemaFile) {
      // TODO: compilation may fail. Better use a promise instead?
      const schemaData = JSON.parse(fs.readFileSync(schemaFile))
      return ajv.compile(schemaData)
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

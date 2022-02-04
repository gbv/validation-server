const fs = require("fs")
const Ajv = require("ajv")
const ajv = new Ajv()

module.exports = {

  "json-schema": {
    id: "schema/json-schema",
    title: "JSON Schema",
    base: "json", // is a JSON format
    for: "json",  // can validate JSON based formats
    contentType: "application/json",
    filename: "schema.json",
    buildValidator(schemaFile) {
      // TODO: compilation may fail. Better use a promise instead?
      const schemaData = JSON.parse(fs.readFileSync(schemaFile))
      return ajv.compile(schemaData)
    },
  },

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
}
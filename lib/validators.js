const compileJSONSchema = require("./json-schema.js")

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
    buildValidator: compileJSONSchema,
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

import jsonSchemaValidator from "./json-schema.js"

export default {

  "json-schema": {
    id: "json-schema",
    title: "JSON Schema",
    base: "json", // is a JSON format
    for: "json",  // can validate JSON based formats
    mimetype: "application/json",
    homepage: "https://json-schema.org/",
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
      {
        version: "draft-04",
        url: "https://json-schema.org/draft-04/schema",
        type: "json-schema",
      },
    ],
    createValidator: jsonSchemaValidator,
  },

  /*
  "rexgep": {
    id: "regexp",
    title: "Regular Expression",
    base: "unicode",
    for: "unicode",
    filename: "pattern.txt",
    schemas: [
      {
        version: "ECMAScript",
        type: "parser",
      }
    ]
  }
*/

  /*
  xsd: {
    id: "schema/xsd",
    title: "XML Schema",
    base: "xml", // is an XML format
    for: "xml",  // can validate XML based formats
    mimetype: "text/xml",
    filename: "schema.xsd",
    // createValidator(schemaFile) {
    //  const xsdValidator = require('xsd-schema-validator')
    //
    // TODO
    // }
  },
  */
}

import jsonSchemaValidator from "./validator/json-schema.js"
import regexpValidator from "./validator/regexp.js"
import parsedFormats from "./parsers.js"

const formats = {
  ...parsedFormats,

  "json-schema": {
    title: "JSON Schema",
    base: "json", // is a JSON format
    restricts: "json",  // can validate JSON based formats
    mimetype: "application/json",
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
    createValidator: jsonSchemaValidator,
  },

  regexp: {
    ...parsedFormats.regexp,
    restricts: "unicode",
    createValidator: regexpValidator,
  },

  /*
  xsd: {
    id: "schema/xsd",
    title: "XML Schema",
    base: "xml", // is an XML format
    restricts: "xml",  // can validate XML based formats
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

export default formats

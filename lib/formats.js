import json from "./format/json.js"
import regexp from "./format/regexp.js"
import xml from "./format/xml.js"
import isbn from "./format/isbn.js"
import jsonSchema from "./format/json-schema.js"
import jskos from "./format/jskos.js"

const formats = {
  json,
  jskos,
  regexp,
  xml,
  isbn,

  "about/data": {
    title: "Data About Data Formats",
    description: "Data format to describe data formats and versions and schemas",

    base: "json",
    versions: {
      default: {
        schemas: [ {
          type: "json-schema",
          url: "https://format.gbv.de/validate/format-schema.json",
        } ],
      },
    },
  },

  "json-schema": jsonSchema,
  /*
  xsd: {
    id: "schema/xsd",
    title: "XML Schema",
    base: "xml", // is an XML format
    restricts: "xml",  // can validate XML based formats
    mimetypes: ["text/xml", "application/xml"],
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

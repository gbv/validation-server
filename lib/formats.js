import json from "./format/json.js"
import regexp from "./format/regexp.js"
import xml from "./format/xml.js"
import xsd from "./format/xsd.js"
import yaml from "./format/yaml.js"
import isbn from "./format/isbn.js"
import jsonSchema from "./format/json-schema.js"
import jskos from "./format/jskos.js"

export default {
  "about/data": {
    title: "Data About Data Formats",
    description: "Data format to describe data formats, versions and schemas",
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
  isbn,
  jskos,
  json,
  "json-schema": jsonSchema,
  regexp,
  xml,
  xsd,
  yaml,
}

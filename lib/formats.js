import isbn from "./format/isbn.js"
import jskos from "./format/jskos.js" // FIXME: this is slow
import json from "./format/json.js"
import jsonSchema from "./format/json-schema.js" // FIXME: this is slow
import ndjson from "./format/ndjson.js"
import regexp from "./format/regexp.js"
import xml from "./format/xml.js"
import xsd from "./format/xsd.js"
import yaml from "./format/yaml.js"

export default {
  "about/data": {
    title: "Data About Data Formats",
    description: "Data format to describe data formats, versions and schemas",
    base: "json",
    // TODO: validate using compiled schema?
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
  ndjson,
  regexp,
  xml,
  xsd,
  yaml,
}

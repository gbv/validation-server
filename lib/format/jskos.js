import validate from "jskos-validate"

import json from "./json.js"
import jsonSchema from "./json-schema.js"

function validateAllSync(data, options = {}) {
  return json.validateWith(data, options.select, parts => {
    const rememberSchemes = []
    return parts.map(record => {
      if (validate(record, { rememberSchemes })) {
        return true
      } else {
        return jsonSchema.mapAjvErrors(validate.errors)
      }
    })
  })
}

export default {
  title: "JSKOS data format for Knowledge Organization Systems",
  short: "JSKOS",
  description: "JSON format based on SKOS",
  base: "json", // TODO: change to JSON-LD
  url: "https://gbv.github.io/jskos/",
  validateAllSync,
  // TODO: add schemas
}

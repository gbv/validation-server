import validate from "jskos-validate"

import json from "./json.js"
import jsonSchema from "./json-schema.js"

function validateAllSync(data, path) {
  return json.validateWith(data, path, parts => {
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
  base: "json",
  url: "https://gbv.github.io/jskos/",
  validateAllSync,
  // TODO: add schemas
}

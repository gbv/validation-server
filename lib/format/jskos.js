import validate from "jskos-validate"

import json from "./json.js"
import { fromAjvError } from "../errors.js"

function validateAllSync(data, options = {}) {
  return json.validateWith(data, options.select, parts => {
    const rememberSchemes = []
    return parts.map(record => {
      if (validate(record, { rememberSchemes })) {
        return true
      } else {
        return validate.errors.map(e => fromAjvError(e))
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

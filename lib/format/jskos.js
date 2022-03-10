import validate from "jskos-validate"

import json from "../format/json.js"
import { ValidationError } from "../errors.js"

export default {
  title: "JSKOS data format for Knowledge Organization Systems",
  short: "JSKOS",
  base: "json",
  url: "https://gbv.github.io/jskos/",

  // TODO: implement validateAll instead to validate multiple records at once
  parse: data => {

    data = json.parse(data)
    if (!validate(data)) {

      // FIXME: there may be multiple errors
      // use mapAjvErrors(validator.errors) for ajv-based errors

      throw new ValidationError({
        message: validate.errorMessages.join("\n"),
        errors: validate.errors,
      })
    }

    return data
  },
}

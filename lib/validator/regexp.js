import parsers from "../parsers.js"
import { ValidationError } from "../errors.js"
import { stringData } from "../source.js"

// Compiles a Regular Expression into a validator function
export default async function createValidator({ value }) {
  const regexp = parsers.regexp.parse(value)

  if (typeof value !== "string") {
    throw new Error("Missing value to create regexp validator")
  }

  return (data, select) => {
    if (typeof select !== "undefined" && select !== null) {
      throw new Error("Validator does not support selection")
    }
    if (regexp.test(stringData(data))) {
      return [true]
    } else {
      return [[new ValidationError({
        message: "Value does not match regular expression",
      })]]
    }
  }
}

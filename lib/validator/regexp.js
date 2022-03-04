import fs from "fs"
import parsers from "../parsers.js"
import { ValidationError } from "../errors.js"
import { stringData } from "../source.js"

// Compiles a Regular Expression into a validator function
export default async function createValidator({ file, value }) {
  const pattern = value || fs.readFileSync(file)
  const regexp = parsers.regexp.parse(pattern)

  return (data, select) => {
    if (select) {
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

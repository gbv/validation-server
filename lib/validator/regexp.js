import fs from "fs"
import parsers from "../parsers.js"
import { ValidationError } from "../errors.js"

// Compiles a JSON Schema file into a validator function.
// May throw an error
export default async function createValidator(file) {
  const pattern = fs.readFileSync(file)

  return parsers.regexp.parse(pattern)
    .then(regexp => {
      const validator = data => {
        if (regexp.test(data)) {
          return true
        } else {
          validator.errors = [new ValidationError({
            message: "Value does not match regular expression",
          })]
          return false
        }
      }
      return validator
    })
}

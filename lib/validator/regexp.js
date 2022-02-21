import fs from "fs"
import parsers from "../parsers.js"
import { ValidationError } from "../errors.js"

// Compiles a JSON Schema file into a validator function.
// May throw an error
export default async function createValidator(file) {
  const pattern = fs.readFileSync(file)

  return parsers.regexp.parse(pattern)
    .then(regexp => {
      return (data => {
        if (regexp.test(data)) {
          return null
        } else {
          return [new ValidationError({
            message: "Value does not match regular expression",
          })]
        }
      })
    })
}

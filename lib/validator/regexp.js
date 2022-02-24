import fs from "fs"
import parsers from "../parsers.js"
import { ValidationError } from "../errors.js"

// Compiles a Regular Expression into a validator function
export default async function createValidator({ file, value }) {
  const pattern = value || fs.readFileSync(file)
  const regexp = parsers.regexp.parse(pattern)

  return (data => {
    if (regexp.test(data)) {
      return null
    } else {
      return [new ValidationError({
        message: "Value does not match regular expression",
      })]
    }
  })
}

import { ValidationError } from "../errors.js"

const literalPattern = new RegExp("^/(.*)/([a-z]*)$","s")

// ECMAScript regular expression with flag u auto-enabled and flags other than i, m, s ignored
export default data => {
  var expression = data, flags = "u"
  try {
    const literal = literalPattern.exec(data)
    if (literal) {
      expression = literal[1]
      flags = literal[1].replaceAll(/[^ims]/,"") + "u"
    }
    return new RegExp(expression, flags)
  } catch(e) {
    throw new ValidationError({ message: e.message, format: "regexp" })
  }
}

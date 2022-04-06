import { ValidationError } from "../errors.js"
import unbuffer from "../unbuffer.js"
import { disallowSelect } from "../utils.js"

const literalPattern = new RegExp("^/(.*)/([a-z]*)$","s")

// ECMAScript regular expression with flag u auto-enabled and flags other than i, m, s ignored
function parse(data) {
  var expression = data, flags = "u"
  try {
    const literal = literalPattern.exec(data)
    if (literal) {
      expression = literal[1]
      flags = literal[1].replace(/[^ims]/g,"") + "u"
    }
    return new RegExp(expression, flags)
  } catch(e) {
    throw new ValidationError({ message: e.message, format: "regexp" })
  }
}

// Compiles a Regular Expression into a validator function
async function createValidator({ value }) {
  const pattern = parse(value)

  if (typeof value !== "string") {
    throw new Error("Missing value to create regexp validator")
  }

  // FIXME: could also return a sync validator
  return async (data, select) => {
    disallowSelect(select, "regexp")
    if (pattern.test(unbuffer(data))) {
      return [true]
    } else {
      return [[new ValidationError({
        message: "Value does not match regular expression",
      })]]
    }
  }
}

export default {
  title: "Regular Expression",
  description: "Formal language to match patterns in character sequences",
  wikidata: "Q185612",
  parse,
  restricts: "unicode",
  createValidator,
}

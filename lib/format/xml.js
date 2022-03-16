import { ValidationError } from "../errors.js"
import { XMLValidator } from "fast-xml-parser"

function parse(data) {
  const result = XMLValidator.validate(data)
  if (result === true) {
    return true
  } else {
    const { err } = result
    throw new ValidationError({
      message: err.msg,
      position: {
        // TODO: include column, e.g. like https://www.rfc-editor.org/rfc/rfc7111.html#section-2.3
        rfc5147: `line=${err.line}`,
      },
    })
  }
}

export default {
  title: "XML",
  description: "Hierarchical data structuring language",
  mimetypes: ["application/xml"],
  wikidata: "Q2115",
  parse,
}

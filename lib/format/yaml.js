import { ValidationError } from "../errors.js"
import YAML from "yaml"

// TODO: support parsing multiple documents (allowed by YAML)
function parse (data) {
  try {
    return YAML.parse(data, { prettyErrors: true })
  } catch(e) {
    const error = { message: e.message }
    if (e.linePos && e.linePos.start) {
      error.position = {
        rfc5147: `char=${e.range.start}`,
        linecol: `${e.linePos.start.line}:${e.linePos.start.col}`,
      }
    }
    throw new ValidationError(error)
  }
}

export default {
  title: "YAML",
  url: "https://yaml.org/",
  description: "Semi-hierarchical data structuring language",
  mimetypes: ["text/yaml"],
  wikidata: "Q281876",
  parse,
  //  validateWith,
}

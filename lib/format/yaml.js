import { ValidationError } from "../errors.js"
import { disallowSelect } from "../utils.js"
import YAML from "yaml"

function yamlError(e) {
  const error = { message: e.message }
  if (e.linePos && e.linePos.start) {
    error.position = {
      rfc5147: `char=${e.range.start}`,
      linecol: `${e.linePos.start.line}:${e.linePos.start.col}`,
    }
  }
  return new ValidationError(error)
}

function parse (data) {
  try {
    return YAML.parse(data, { prettyErrors: true })
  } catch(e) {
    throw yamlError(e)
  }
}

function validateAllSync(data, select) {
  disallowSelect(select, "yaml")
  const docs = YAML.parseAllDocuments(data, { prettyErrors: true })
  return docs.map(doc => {
    if (doc.errors && doc.errors.length) {
      return doc.errors.map(yamlError)
    } else {
      return true
    }
  })
}

export default {
  title: "YAML",
  url: "https://yaml.org/",
  description: "Semi-hierarchical data structuring language",
  mimetypes: ["text/yaml"],
  wikidata: "Q281876",
  parse,
  validateAllSync,
}

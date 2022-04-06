import { ValidationError } from "../errors.js"
import { disallowSelect } from "../utils.js"
import YAML from "yaml"

function yamlError(e) {
  const error = { message: e.message }
  if (e.linePos) {
    error.position = {
      rfc5147: `char=${e.pos[0]}`,
      linecol: `${e.linePos[0].line}:${e.linePos[0].col}`,
    }
  }
  return new ValidationError(error)
}

function parse (data) {
  const docs = YAML.parseAllDocuments(data, { prettyErrors: true })
  const hasError = docs.find(d => d.errors && d.errors.length)
  if (hasError) {
    throw yamlError(hasError.errors[0])
  }
  // NOTE: returns YAML documents reduced to JSON model
  return docs.map(d => d.toJS())
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
  encodes: "json",
  mimetypes: ["text/yaml"],
  wikidata: "Q281876",
  validateAllSync,
  parse,
}

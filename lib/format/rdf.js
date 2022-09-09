import rdfParse from "rdf-parse"
const rdfParser = rdfParse.default

import { finished } from "stream/promises"
import Streamify from "streamify-string"

export const ntriples = {
  title: "N-Triples",
  description: "RDF Serialization",
  mimetypes: ["application/n-triples"],
  url: "https://www.w3.org/TR/n-triples/",
}

export const turtle = {
  title: "Turtle",
  description: "RDF Serialization",
  mimetypes: ["text/turtle"],
  url: "https://www.w3.org/TR/turtle/",
}

// TODO: may require different error handling, better use XML parser first?
export const rdfxml = {
  title: "RDF/XML",
  description: "RDF Serialization",
  mimetypes: ["application/rdf+xml"],
  url: "https://www.w3.org/TR/rdf-syntax-grammar/",
}

for(let f of [ntriples,turtle,rdfxml]) {
  const contentType = f.mimetypes[0]
  f.validateAll = async (data) => { // TODO: options
    if (typeof data === "string") {
      data = Streamify(data)
    }
    const errors = []

    // TODO: optional baseIRI
    const parsing = rdfParser.parse(data, { contentType })
    await finished(parsing.resume()).catch(({message, context}) => {
      const position = { rfc5147: `line=${context.line}` }
      if (context.previousToken && context.previousToken.end) {
        position.linecol = `${context.line}:${context.previousToken.end+1}`
      }
      errors.push({ message, position })
    })

    return errors.length ? [errors] : [true]
  }
}

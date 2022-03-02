import parseJSON from "./parser/json.js"
import parseISBN from "./parser/isbn.js"
import parseRegexp from "./parser/regexp.js"
import parseXML from "./parser/xml.js"

export default {
  json: {
    title: "JSON",
    url: "https://json.org/",
    description: "Hierarchical data structuring language",
    mimetype: "application/json",
    wikidata: "Q2063",
    parse: parseJSON,
  },
  regexp: {
    title: "Regular Expression",
    description: "Formal language to match patterns in character sequences",
    wikidata: "Q185612",
    parse: parseRegexp,
  },
  isbn: {
    title: "ISBN",
    wikidata: "Q33057",
    description: "International book identifier assigned by publishers",
    parse: parseISBN,
  },
  xml: {
    title: "XML",
    description: "Hierarchical data structuring language",
    mimetype: "application/xml",
    wikidata: "Q2115",
    parse: parseXML,
  },
}

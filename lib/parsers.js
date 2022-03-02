import parseJSON from "./parser/json.js"
import parseISBN from "./parser/isbn.js"
import parseRegexp from "./parser/regexp.js"
import parseXML from "./parser/xml.js"

export default {
  json: {
    title: "JSON",
    url: "https://json.org/",
    mimetype: "application/json",
    parse: parseJSON,
  },
  regexp: {
    title: "Regular Expression",
    parse: parseRegexp,
  },
  isbn: {
    title: "ISBN",
    parse: parseISBN,
  },
  xml: {
    title: "XML",
    mimetype: "application/xml",
    parse: parseXML,
  },
}

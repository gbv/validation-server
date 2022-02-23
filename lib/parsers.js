import parseJSON from "./parser/json.js"
import parseISBN from "./parser/isbn.js"
import parseRegexp from "./parser/regexp.js"

export default {
  json: {
    id: "json",
    title: "JSON",
    homepage: "https://json.org/",
    mimetype: "application/json",
    parse: parseJSON,
  },
  regexp: {
    id: "regexp",
    title: "Regular Expression",
    for: "unicode",
    parse: parseRegexp,
  },
  isbn: {
    id: "isbn",
    title: "ISBN",
    parse: parseISBN,
  },
}

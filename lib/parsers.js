import parseJSON from "./parser/json.js"
import parseISBN from "./parser/isbn.js"
import parseRegexp from "./parser/regexp.js"

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
}

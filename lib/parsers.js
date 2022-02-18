import parseJSON from "./parser/json.js"
import parseISBN from "./parser/isbn.js"

export default {
  json: {
    id: "json",
    title: "JSON",
    homepage: "https://json.org/",
    mimetype: "application/json",
    parse: parseJSON,
  },
  isbn: {
    id: "isbn",
    title: "ISBN",
    parse: parseISBN,
  },
}

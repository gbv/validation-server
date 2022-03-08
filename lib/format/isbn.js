import { ValidationError } from "../errors.js"
import ISBN from "isbn3"

export default {
  title: "ISBN",
  wikidata: "Q33057",
  description: "International book identifier assigned by publishers",
  parse: data => {
    const isbn = ISBN.parse(data + "")
    if (isbn && isbn.isValid) {
      return isbn.isbn13h
    } else {
      throw new ValidationError({ message: "Invalid ISBN", format: "isbn" })
    }
  },
}

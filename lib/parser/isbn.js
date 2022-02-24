import { ValidationError } from "../errors.js"
import ISBN from "isbn3"

export default data => {
  const isbn = ISBN.parse(data + "")
  if (isbn && isbn.isValid) {
    return isbn.isbn13h
  } else {
    var message = "Invalid ISBN"
    if (isbn) {
      const hint = ISBN.audit(isbn.source)
      if (hint && hint.clues && hint.clues.length) {
        message += ": " + hint.clues.map(c => c.message).join(", ")
      }
    }
    throw new ValidationError({  message, format: "isbn" })
  }
}

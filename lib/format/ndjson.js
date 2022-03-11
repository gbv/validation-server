import { ValidationError } from "../errors.js"

function parse (data) {
  const lines = data.split("\n")
  for (let i=0; i<lines.length; i++) {
    try {
      lines[i] = JSON.parse(lines[i])
    } catch(e) {
      throw new ValidationError(`Line ${i} is no valid JSON`)  
    }
  }
  return lines
}

export default {
  title: "Newline Delimited JSON",
  short: "ndjson",
  url: "https://ndjson.org/",
  description: "List of lines, each being a valid JSON value",
  mimetypes: [
    "application/x-ndjson",
    "application/x-jsonlines",
  ],
  parse,
}

import { ValidationError } from "../errors.js"

function parse (data) {
  const lines = data.split("\n")
  for (let i=0; i<lines.length; i++) {
    try {
      lines[i] = JSON.parse(lines[i])
    } catch(e) {
      // TODO: more detailed error message
      throw new ValidationError({
        message: `Line ${i+1} is no valid JSON`,
        position: {
          rfc5147: `line=${i+1}`,
        },
      })
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

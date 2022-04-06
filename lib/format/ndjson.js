import ndjson from "../json.js"

export default {
  title: "Newline Delimited JSON",
  short: "ndjson",
  url: "https://ndjson.org/",
  description: "List of lines, each being a valid JSON value",
  mimetypes: [
    "application/x-ndjson",
    "application/x-jsonlines",
  ],
  parse: ndjson.parseSync,
}

import { ValidationError } from "../errors.js"

function parse (data) {
  try {
    return JSON.parse(data)
  } catch(e) {
    const message = e.message
    var pos = message.match(/^Unexpected .+ .*position\s+(\d+)/i)
    pos = pos ? +pos[1] : message.match(/^Unexpected end of JSON.*/i)
      ? data.length : /* c8 ignore next */ 0
    throw new ValidationError({
      message,
      format: "json",
      position: {
        rfc5147: `char=${pos}`,
      },
    })
  }
}

export default {
  title: "JSON",
  url: "https://json.org/",
  description: "Hierarchical data structuring language",
  mimetype: "application/json",
  wikidata: "Q2063",
  parse,
  // TODO: select
}

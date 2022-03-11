import { ValidationError, MalformedRequest } from "../errors.js"
import unbuffer from "../unbuffer.js"

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

function select(data, path) {
  if ((path ?? "$") === "$") {
    return [data]
  } else if (path === "$.*") {
    if (Array.isArray(data)) {
      return data
    } else if (data instanceof Object) {
      return Object.values(data)
    } else {
      return []
    }
  } else {
    throw new MalformedRequest("Invalid or unsupported selection (did you mean '$.*' or '$'?)")
  }
}

function validateWith(data, path, fn) {
  data = unbuffer(data)

  if (typeof data === "string") {
    try {
      data = parse(data)
    } catch(e) {
      return [[e]]
    }
  }

  data = select(data, path)

  return fn(data)
}

export default {
  title: "JSON",
  url: "https://json.org/",
  description: "Hierarchical data structuring language",
  mimetypes: ["application/json"],
  wikidata: "Q2063",
  parse,
  validateWith,
}

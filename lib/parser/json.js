import { ValidationError } from "../errors.js"

export default function (data) {
  try {
    return JSON.parse(data)
  } catch(e) {
    const message = e.message
    var pos = message.match(/^Unexpected .+ .*position\s+(\d+)/i)
    pos = pos ? +pos[1] : message.match(/^Unexpected end of JSON.*/i) ? data.length : 0
    throw new ValidationError({
      message,
      format: "json",
      position: {
        rfc5147: `char=${pos}`,
      },
    })
  }
}

const { MalformedRequestError } = require("./errors.js")

module.exports = class ValidatorService {
  constructor(formats) {
    this.formats = formats
  }

  async validate(query) {
    const { data, format } = query

    if (!format) {
      throw new MalformedRequestError("Missing query parameter: format")
    }

    if (format === "json") {
      return this.validateJSON(data, { schema: undefined })
    }

    // TODO: validate with JSON schema

    return []
  }

  async validateJSON(data, options = {}) {
    if (!Array.isArray(data)) {
      data = [data]
    }

    if (options.schema) {
      // TODO: use JSON schema
    }

    return data.map(() => true)
  }
}

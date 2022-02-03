const { MalformedRequestError, NotFoundError } = require("./errors.js")

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

    const schema = this.formats.schema(query)

    if (!schema) {
      throw new NotFoundError("No matching schema found")
    }

    // TODO: don't assume JSON
    return this.validateJSON(query.data, { schema })
  }

  async validateJSON(data, options = {}) {
    if (!Array.isArray(data)) {
      data = [data]
    }

    if (options.schema) {
      const { validator } = options.schema
      if (validator) {
        return data.map(record => {
          const valid = validator(record)
          return valid ? true : validator.errors
        })
      }
    }

    return data.map(() => true)
  }
}

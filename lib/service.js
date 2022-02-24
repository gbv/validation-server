import knownFormats from "./formats.js"
import { ValidationError } from "./errors.js"

async function addValidators(format, config) {
  const { id, versions } = format
  const { cache } = config

  const schemas = Object.keys(versions || {})
    .filter(key => versions[key].schemas)
    .map(key => versions[key].schemas.map(s => ({...s, version: key})))
    .flat()

  if (!schemas.length && !format.validate) {
    const { parse } = format
    if (parse) {
      format.validate = data => {
        try {
          parse(data)
          return null
        } catch(e) {
          return [e]
        }
      }
    } else {
      config.warn(`format ${id} has no schemas for validation`)
      return
    }
  }

  await Promise.all(schemas.map(async schema => {
    const { type, version, url, value } = schema

    const { createValidator } = knownFormats[type] || {}
    if (!createValidator) {
      throw new Error(`Unknown schema type ${type} in ${id} ${version}`)
    }

    schema.validate = await createValidator({ url, value, cache })

    format.validate = schema.validate // TODO: take default version/schema
  }))

  // add validation method as promise
  format.valid = async data => {
    const errors = format.validate(data)
    if (errors) {
      throw new ValidationError({ errors })
    } else {
      return data
    }
  }

  return format
}


class ValidationService {

  // Don't create instance with "new"...
  constructor(formats) {
    this.formats = formats
  }

  // ...but use async creator instead.
  static async create(config) {
    const { formats } = config

    await Promise.all(
      Object.values(formats).map(async format => await addValidators(format, config)),
    )

    return new ValidationService(formats)
  }

  getFormat(query={}) {
    if (!query.format) return
    if (!query.version) query.version = "default"
    return this.listFormats(query)[0]
  }

  listFormats(query={}) {
    const queriedFormat = (query.format || "").replace(/^schema[/]/,"")
    return Object.values(this.formats)
      // optionally select by format identifier (prefix schema/ is removed)
      .filter(format => format.id === queriedFormat || !queriedFormat)
      // filter (by) versions
      .map(({versions,...format}) => {
        var onlyVersion = query.version

        if (onlyVersion === "default") {
          if (versions) {
            onlyVersion = Object.keys(versions).sort().reverse()[0]
          } else {
            onlyVersion = null
          }
        }

        if (onlyVersion) {
          if (onlyVersion in versions) {
            versions = { [onlyVersion]: versions[onlyVersion] }
          } else {
            return
          }
        }

        if (!versions) {
          return format
        }

        // TODO: optionally filter by schema type

        return { ...format, versions }
      })
      .filter(Boolean)
      .sort((a, b) => a.id > b.id ? 1 : -1)
  }

  listLanguages(query) {
    return this.listFormats(query)
      .filter(format => format.createValidator)
  }

  guessFromContentType(type) {
    if (!type) return
    if (type.match(/application\/json/)) return "json"
    if (type.match(/[/+]xml/)) return "xml"
    // ...
  }
}

const createService = async config => ValidationService.create(config)

export default createService

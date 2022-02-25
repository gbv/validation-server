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
      config.warn(`Skipping schema of unknown language ${type} in ${id} ${version}`)
      return
    }

    schema.validate = await createValidator({ url, value, cache })
      .catch(() => {
        config.warn(`Failed to create ${type} validator for ${id} ${version}`)
        return
      })

    format.validate = schema.validate // TODO: take default version/schema
  }))

  if (!format.validate) return

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
    return Promise.all(
      Object.entries(config.formats)
        .map(([id, format]) => ({...format, id})) // override format.id
        .map(async format => await addValidators(format, config)),
    ).then(f => f.filter(Boolean)) // remove formats without validator
      .then(f => Object.fromEntries(f.map(f => [f.id,f])))
      .then(f => new ValidationService(f))
  }

  getFormat(query={}) {
    if (!query.format) return
    if (!query.version) query.version = "default"
    return this.listFormats(query)[0]
  }

  listFormats(query={}) {
    return Object.values(this.formats)
      // optionally select by format identifier
      .filter(format => format.id === query.format || !query.format)
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

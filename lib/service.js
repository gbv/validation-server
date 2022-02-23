import validators from "./validators.js"
import parsers from "./parsers.js"

async function formatEntry(formatObject, config) {
  const { id, base, schemas } = formatObject
  const versions = {}
  const parser = parsers[id] ? parsers[id].parse : null

  if (!parsers && !(schemas || []).length) {
    config.warn(`format ${id} has no schemas or parser for validation`)
    return
  }

  if (schemas) {
    await Promise.all(schemas.map(async schema => {
      const { type, version, url, value } = schema
      const versionName = version || "default"

      if (!(type in validators)) {
        throw new Error(`Unknown schema type ${type} in ${id} ${versionName}`)
      }

      if (!url && !value) {
        throw new Error(`Missing schema url or value in ${id} ${versionName}`)
      }

      const validator = { url, value, cache: config.cache }
      schema.validator = await validators[type].createValidator(validator)

      if (versionName in versions) {
        versions[versionName][type] = schema
      } else {
        versions[versionName] = { [type]: schema }
      }
    }))
  }

  return { id, base, versions, parser }
}


/**
 * Internally stores a set of formats, each with
 *
 * - a unique identifier
 * - an optional set of versions, each with
 *   - a unique name
 *   - an optional set of schemas, each with
 *      - a unique schema type
 *      - an url
 *      - a local file
 *
 * Formats with versions also have a default version name.
 *
 * Externally, a format is given and returned as format object with
 *
 * - a unique `id`
 * - an optional array of `schemas`, each an object with
 *   - an optional `version`
 *   - an url
 *
 * Formats and schemas may have additional keys.
 */
class ValidationService {

  // Don't create instance with "new"...
  constructor(registry) {
    this.registry = registry
  }

  // ...but use async creator instead.
  static async create(config) {
    const registry = {}

    await Promise.all(config.formats.map(async format => {
      registry[format.id] = await formatEntry(format, config)
    }))

    return new ValidationService(registry)
  }

  getFormat(query) {
    if (!query.format) return
    if (!query.version) query.version = "default"
    return this.listFormats(query)[0]
  }

  listFormats(query) {
    const queriedFormat = (query.format || "").replace(/^schema[/]/,"")
    return Object.values(this.registry)
      // optionally select by format identifier (prefix schema/ is removed)
      .filter(format => format.id === queriedFormat || !queriedFormat)
      .map(({versions,...format}) => {

        // optionally select by and filter schema version
        if (versions && query.version) {
          if (query.version === "default") {
            query.version = Object.keys(versions).sort().reverse()[0]
          }
          versions = query.version in versions ? [versions[query.version]] : []
        } else if (!versions) {
          // formats without versions don't have schemas
          return format
        }

        // map schemas of versions to array
        var schemas = Object.values(versions)
          .map(s => Object.values(s))
          .flat()

        // optionally filter schemas by schema type
        if (query.type) {
          schemas = schemas.filter(s => s.type === query.type)
          if (!schemas.length) return
        }

        return schemas.length ? { ...format, schemas } : format
      })
      .filter(Boolean)
  }

  listTypes(query = {}) {
    const { type } = query
    return Object.values(this.registry)
      .filter(t => t.id in validators && (!type || t.id === type))
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

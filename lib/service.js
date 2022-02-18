import path from "path"
import downloadSchema from "./download.js"
import validators from "./validators.js"
import parsers from "./parsers.js"

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
  constructor(registry, types) {
    this.registry = registry
    this.types = types
  }

  // ...but use async creator instead!
  // Expects config.formats to contain valid formats objects
  static async create(config) {
    const registry = {}

    await Promise.all(config.formats.map(async formatObject => {
      const { id, base, schemas } = formatObject
      const versions = {}

      if (!schemas || !schemas.length) {
        registry[id] = formatObject
        if (!(id in parsers)) {
          config.warn(`format ${id} has no schemas or parser for validation`)
        }
        return
      }

      await Promise.all(schemas.map(async schema => {
        const { url, type, version } = schema
        const versionName = version || "default"

        if (!config.types.find(t => t.id === type)) {
          throw new Error(`Unknown schema type ${type} in ${id} ${versionName}`)
        }

        const { filename, createValidator } = validators[type]

        if (!url) {
          throw new Error(`Missing url in ${id} ${versionName}`)
        }

        const schemaFile = path.join(config.formatsDirectory, id, versionName, filename)
        await downloadSchema(url, schemaFile, config)
          .catch(() => { throw new Error(`Failed to download ${url}`) })

        schema.file = path.join(id, versionName, filename)
        schema.validator = await createValidator(schemaFile)

        if (versionName in versions) {
          versions[versionName][type] = schema
        } else {
          versions[versionName] = { [type]: schema }
        }
      }))

      registry[id] = { id, base, versions }
    }))

    // TOOD: move config.types
    return new ValidationService(registry, config.types)
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

        // map schemas of versions to array, excluding key `file`
        var schemas = Object.values(versions)
          .map(s => Object.values(s).map(
            // eslint-disable-next-line no-unused-vars
            query.withFile ? s => s : ({file, ...s}) => s,
          ))
          .flat()

        // optionally filter schemas by schema type
        if (query.type) {
          schemas = schemas.filter(s => s.type === query.type)
          if (!schemas.length) return
        }

        return { ...format, schemas }
      })
      .filter(Boolean)
  }

  listTypes(query = {}) {
    const { type } = query
    return this.types.filter(t => !type || t.id === type)
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

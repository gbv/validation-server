const path = require("path")
const downloadSchema = require("./download.js")
const validators = require("./validators.js")

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
 * - an optional array of `schemes`, each an object with
 *   - an optional `version`
 *   - an url
 *
 * Formats and schemes may have additional keys.
 */
class FormatRegistry {

  // Don't create instance with "new"...
  constructor(registry) {
    this.registry = registry
  }

  // ...but use async builder instead!
  // Builder expects config.formats to contain valid formats objects
  static async build(config) {
    const registry = {}

    // TODO: validate config.formats

    await Promise.all(config.formats.map(async formatObject => {
      const { id, base, schemas } = formatObject
      const versions = {}

      if (!schemas || !schemas.length) {
        registry[id] = formatObject
        return
      }

      await Promise.all(schemas.map(async schema => {
        const { url, type, version } = schema
        const versionName = version || "default"

        if (!config.types.find(t => t.id === type)) {
          throw new Error(`Unknown schema type ${type} in ${id} ${versionName}`)
        }

        const { filename, buildValidator } = validators[type]

        if (!url) {
          throw new Error(`Missing url in ${id} ${versionName}`)
        }

        const schemaFile = path.join(config.formatsDirectory, id, versionName, filename)
        await downloadSchema(url, schemaFile, config)
        schema.file = path.join(id, versionName, filename)

        if (buildValidator) {
          schema.validator = buildValidator(schemaFile)
        }

        if (versionName in versions) {
          versions[versionName][type] = schema
        } else {
          versions[versionName] = { [type]: schema }
        }
      }))

      // TODO: find out default version if there is no version named "default"

      registry[id] = { id, base, versions }
    }))

    return new FormatRegistry(registry)
  }

  getSpecificFormat(query) {
    if (!query.format) return
    if (!query.version) query.version = "default"
    return this.getFormats(query)[0]
  }

  getFormats(query) {
    return Object.values(this.registry)
      // optionally select by format identifier
      .filter(format => format.id === query.format || !query.format)
      .map(({versions,...format}) => {

        // optionally select by version
        if (query.versions) {
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

  guessFromContentType(type) {
    if (!type) return
    if (type.match(/application\/json/)) return "json"
    if (type.match(/[/+]xml/)) return "xml"
    // ...
  }
}

module.exports = async config => FormatRegistry.build(config)

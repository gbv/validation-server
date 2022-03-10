import knownFormats from "./formats.js"
import { ValidationError } from "./errors.js"
import createLogger from "./logger.js"
import { stringData } from "./source.js"
import { MalformedRequest, NotFound } from "./errors.js"
import Cache from "../lib/cache.js"
import { Transform } from "stream"
import fs from "fs"
import path from "path"
const __dirname = new URL(".", import.meta.url).pathname

async function addValidators(format, service) {
  const { id, versions } = format
  const { cache, logger } = service

  const schemas = Object.keys(versions || {})
    .filter(key => versions[key].schemas)
    .map(key => versions[key].schemas.map(s => ({...s, version: key})))
    .flat()

  if (!schemas.length && !format.valid && !format.validateAll) {
    const { parse } = format
    if (parse) {
      format.validateAll = (data, select) => {
        if (typeof select !== "undefined" && select !== null) {
          throw new MalformedRequest("Validator does not support selection")
        }
        try {
          parse(stringData(data))
          return [true]
        } catch(e) {
          return [[e]]
        }
      }
    } else {
      logger.warn(`format ${id} has no schemas for validation`)
      return
    }
  }

  await Promise.all(schemas.map(async schema => {
    const { type, version, url, value } = schema

    const { createValidator, restricts } = knownFormats[type] || {}
    if (!createValidator) {
      logger.warn(`Skipping schema of unknown language ${type} in ${id} ${version}`)
      return
    }

    if (!format.base) {
      format.base = restricts
    }

    schema.validateAll = await createValidator({ url, value, cache, logger })
      .catch(e => {
        logger.warn(`Failed to create ${type} validator for ${id} ${version}`)
        logger.debug(e)
        return
      })

    if (!format.validateAll) {
      format.validateAll = schema.validateAll // TODO: take default version/schema
    }
  }))

  if (!format.validateAll) return

  // Synchronous validation of one record
  format.validSync = data => {
    const [ result ] = format.validateAll(data)
    return result === true ? null : result
  }

  // Asynchronous validation of one record
  format.valid = async data => {
    const errors = format.validSync(data)
    if (errors) {
      throw new ValidationError({ errors })
    } else {
      return data
    }
  }

  // Validate stream of records
  format.validateStream = new Transform({
    objectMode: true,
    transform(data, encoding, done) {
      done(null, format.validateAll(data)[0])
    },
  })

  return format
}

class ValidationService {

  constructor({ title, version, description, cache, logger }) {
    this.title = title
    this.version = version
    this.description = description
    this.formats = {}
    this.cache = cache
    this.logger = logger || createLogger({level:"error"})
  }

  async addFormat(format) {
    const service = this
    return addValidators(format, this)
      .then(format => {
        if (format) {
          service.formats[format.id] = format
        }
        // TODO: throw else?
      })
  }

  getFormat(format, query={}) {
    if (!format) return
    query.format = format
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

  // only used internally
  async promiseSchema(format) {
    const versions = Object.values(format.versions || {}).filter(v => v.schemas)
    if (versions.length) {
      const schema = versions[0].schemas[0]
      if (schema.url) {
        const file = await this.cache.get(schema.url)
        if (!file) {
          throw new NotFound("Schema file not found")
        }
        return { ...schema, file }
      } else {
        return schema
      }
    } else {
      throw new NotFound(`Format ${format.id} has no schemas`)
    }
  }
}

const createService = async config => {

  // initialize cache
  const { cachePath } = config
  const cache = new Cache(cachePath)

  const schemaFiles = {
    "https://format.gbv.de/validate/format-schema.json": "../public/format-schema.json",
    "https://format.gbv.de/validate/config-schema.json": "../public/config-schema.json",
    "https://json-schema.org/draft-07/schema": "../config/json-schema-draft-07.json",
    "https://json-schema.org/draft-06/schema": "../config/json-schema-draft-06.json",
    "https://json-schema.org/draft-04/schema": "../config/json-schema-draft-04.json",
  }
  for (const [uri, file] of Object.entries(schemaFiles)) {
    await cache.put(uri, fs.readFileSync(path.resolve(__dirname, file)))
  }

  cache.keys().then(keys => config.logger.info(`cachePath ${cachePath} contains ${keys.length} entries`))

  const service = new ValidationService({ ...config, cache })
  return Promise.all(
    Object.entries(config.formats)
      .map(([id, format]) => ({...format, id})) // override format.id
      .map(format => service.addFormat(format)),
  ).then(() => {
    return service
  })
}

export default createService

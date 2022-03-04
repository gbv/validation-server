import fs from "fs"
import path from "path"
import createLogger from "../lib/logger.js"

import knownFormats from "../lib/formats.js"
import Cache from "../lib/cache.js"

const __dirname = new URL(".", import.meta.url).pathname
const readJSON = file => JSON.parse(fs.readFileSync(path.resolve(__dirname, file)))

export default async function loadConfig({ NODE_ENV, CONFIG_FILE, ...options } = process.env) {
  const env = NODE_ENV || "development"
  const configFile = path.resolve(__dirname, CONFIG_FILE
    ?? (env === "test" || env === "debug" ? `./config.${env}.json` : "./config.json"))

  // Load default config
  const configDefault = readJSON("./config.default.json")

  const { version, description } = readJSON("../package.json")
  let config = { ...configDefault, version, description }

  // Load local config
  try {
    let configLocal = readJSON(configFile)
    config = { ...config, ...configLocal }
  } catch(error) {
    const msg = `Failed to load configuration from ${configFile}.`
    if (CONFIG_FILE) {
      throw new Error(msg)
    } else {
      const logger = options.logger ?? createLogger({level:config.verbosity})
      logger.warn(`Warning: ${msg} Running with default settings.`)
    }
  }

  const logger = options.logger || createLogger({level: env === "test" ? "silent" : config.verbosity})

  // Optionally load formats from file
  if (typeof config.formats === "string") {
    const formatsFile = path.resolve(path.dirname(configFile), config.formats)
    config.formats = readJSON(formatsFile)
    logger.info(`Formats loaded from ${formatsFile}`)
  }

  // knownFormats override configured formats
  config.formats = { ...config.formats, ...knownFormats }

  // initialize cache
  const cachePath = (env === "test" || env === "debug") ? null :
    path.resolve(__dirname, config.cachePath || "formats")
  const cache = new Cache(cachePath)
  const schemaFiles = {
    "https://format.gbv.de/validate/format-schema.json": "../public/format-schema.json",
    "https://format.gbv.de/validate/config-schema.json": "../public/config-schema.json",
    "https://json-schema.org/draft-07/schema": "json-schema-draft-07.json",
    "https://json-schema.org/draft-06/schema": "json-schema-draft-06.json",
    "https://json-schema.org/draft-04/schema": "json-schema-draft-04.json",
  }
  for (const [uri, file] of Object.entries(schemaFiles)) {
    await cache.put(uri, fs.readFileSync(path.resolve(__dirname, file)))
  }

  cache.keys().then(keys => logger.info(`cachePath ${cachePath} contains ${keys.length} entries`))

  // validate configuration
  const url = "https://format.gbv.de/validate/config-schema.json"
  const validate = await knownFormats["json-schema"].createValidator({url, cache, logger})
  const rawConfig = JSON.parse(JSON.stringify(config)) // omit functions

  logger.debug(JSON.stringify(rawConfig, null, "  "))
  const errors = validate(rawConfig)
  if (errors) {
    const msg =`Invalid configuration from ${configFile}`
    logger.error(msg)
    errors.forEach(e => logger.warn(e))
    throw new Error(msg)
  }

  // additional fields for internal use
  config.configFile = configFile
  config.env = env
  config.cache = cache
  config.logger = logger

  return config
}

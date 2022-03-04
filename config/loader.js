import fs from "fs"
import path from "path"
import createLogger from "../lib/logger.js"

import knownFormats from "../lib/formats.js"
import Cache from "../lib/cache.js"

const __dirname = new URL(".", import.meta.url).pathname
const readJSON = file => JSON.parse(fs.readFileSync(path.resolve(__dirname, file)))

export default async function loadConfig(configFile, logger) {

  // Load default config
  const configDefault = readJSON("./config.default.json")
  const { version, description } = readJSON("../package.json")
  var configPath = __dirname // default config/ directory
  var config = { ...configDefault, version, description }

  // Find and local local config
  const env = process.env.NODE_ENV || "development"
  const testing = env === "test" || env === "debug"

  if (configFile === undefined) {
    const file = path.resolve(__dirname, testing ? "./config.test.json" : "./config.json")
    if (fs.existsSync(file)) {
      configFile = file
    }
  }

  if (configFile) {
    try {
      var configLocal = readJSON(configFile)
      config = { ...config, ...configLocal }
      configPath = path.dirname(configFile)
    } catch(error) {
      throw new Error(`Failed to load configuration from ${configFile}`)
    }
  }

  if (!logger) {
    logger = createLogger({level: env === "test" ? "silent" : config.verbosity})
  }

  if (configFile) {
    logger.info(`Loaded configuration from ${configFile}`)
  }

  // Optionally load formats from file
  if (typeof config.formats === "string") {
    const formatsFile = path.resolve(configPath, config.formats)
    config.formats = readJSON(formatsFile)
    logger.info(`Formats loaded from ${formatsFile}`)
  }

  // knownFormats override configured formats
  config.formats = { ...config.formats, ...knownFormats }

  // initialize cache
  const cachePath = testing ? null : path.resolve(configPath, config.cachePath || "formats")
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

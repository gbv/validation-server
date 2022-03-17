import fs from "fs"
import path from "path"

import createLogger from "./logger.js"
import knownFormats from "./formats.js"

import tmp from "tmp"
tmp.setGracefulCleanup()

const __dirname = new URL(".", import.meta.url).pathname
const readJSON = file => JSON.parse(fs.readFileSync(path.resolve(__dirname, file)))

export function loadConfig(configFile, logger) {

  // Load default config file
  const configDefault = readJSON("../config/config.default.json")
  const { version, description } = readJSON("../package.json")
  var configPath = __dirname // default config/ directory
  var config = { ...configDefault, version, description }

  // Find and load local config file
  const env = process.env.NODE_ENV || "development"
  const testing = env === "test" || env === "debug"

  if (configFile === undefined) {
    const file = path.resolve(__dirname, "../config", testing ? "config.test.json" : "config.json")
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

  if (testing) {
    config.cachePath = tmp.dirSync().name
  } else {
    config.cachePath = path.resolve(configPath, config.cachePath || "cache")
  }

  // additional fields for internal use
  config.env = env
  config.configFile = configFile
  config.logger = logger

  return validateConfig(config)
}

// Directly use ajv to avoid async compilation of schemas

import Ajv from "ajv"
import ajvFormats from "ajv-formats"
import jsonSchema from "./format/json-schema.js"

const configSchema = readJSON("../public/config-schema.json")
const formatSchema = readJSON("../public/format-schema.json")
configSchema.properties.formats.anyOf[0].patternProperties["^[0-9a-z_/-]+$"] = formatSchema
const ajv = new Ajv()
ajvFormats(ajv)
const validator = ajv.compile(configSchema)

export function validateConfig(config) {

  // eslint-disable-next-line no-unused-vars
  var { env, logger, configFile, ...coreConfig } = config

  if (!logger) {
    logger = createLogger({level: env === "test" ? "silent" : config.verbosity})
  }

  const rawConfig = JSON.stringify(coreConfig, null, "  ")
  logger.debug(rawConfig)

  if (validator(JSON.parse(rawConfig))) {
    return config
  } else {
    const msg = "Invalid configuration" + (configFile ? ` from ${configFile}` : "")
    logger.error(msg)
    jsonSchema.mapAjvErrors(validator.errors).forEach(e => logger.warn(e))
    throw new Error(msg)
  }
}

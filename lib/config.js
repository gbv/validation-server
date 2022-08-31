import fs from "fs"
import path from "path"

// Use precompiled JSON Schema validation
import { fromAjvError } from "./errors.js"
import { configValidation } from "./compiled-schemas.js"

import createLogger from "./logger.js"

import { knownFormats } from "./formats.js"

import json from "./format/json.js"
import ndjson from "./format/ndjson.js"

const __dirname = new URL(".", import.meta.url).pathname

function readFile (file) {
  file = path.resolve(__dirname, file)

  if (file.match(/\.ndjson$/)) {
    return ndjson.parse(fs.readFileSync(file))
  } else {
    return json.parse(fs.readFileSync(file))
  }
}

export function loadConfig(configFile, logger) {

  // Load default config file
  const configDefault = readFile("../config/config.default.json")
  const { version, description } = readFile("../package.json")
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
      var configLocal = readFile(configFile)
      config = { ...config, ...configLocal }
      configPath = path.dirname(configFile)
    } catch(error) {
      throw new Error(`Failed to load configuration ${configFile}`)
    }
  }

  if (!logger) {
    logger = createLogger({level: env === "test" ? "silent" : config.verbosity})
  }

  if (configFile) {
    logger.info(`Loaded configuration ${configFile}`)
  }

  // Optionally load formats from file
  if (typeof config.formats === "string") {
    const formatsFile = path.resolve(configPath, config.formats)
    config.formats = readFile(formatsFile)
    logger.info(`Formats loaded from ${formatsFile}`)
  }

  if (Array.isArray(config.formats)) {
    if (config.formats.filter(f => !f.id).length) {
      throw new Error(`Invalid configuration ${configFile}`)
    }
    config.formats = Object.fromEntries(config.formats.map((f => [f.id, f])))
    // knownFormats override configured formats
    // TODO: only include if needed to reduce loading time
  }
  config.formats = { ...config.formats, ...knownFormats }

  if (config.cache) {
    config.cache = path.resolve(configPath, config.cache)
  }

  // additional fields for internal use
  config.env = env
  config.configFile = configFile
  config.logger = logger

  return validateConfig(config)
}

export function validateConfig(config) {

  // eslint-disable-next-line no-unused-vars
  var { env, logger, configFile, ...coreConfig } = config

  if (!logger) {
    logger = createLogger({level: env === "test" ? "silent" : config.verbosity})
  }

  const rawConfig = JSON.stringify(coreConfig, null, "  ")
  logger.debug(rawConfig)

  if (configValidation(JSON.parse(rawConfig))) {
    return config
  } else {
    const msg = "Invalid configuration" + (configFile ? ` ${configFile}` : "")
    logger.error(msg)
    configValidation.errors.forEach(e => logger.warn(fromAjvError(e)))
    throw new Error(msg)
  }
}

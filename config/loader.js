import fs from "fs"
import os from "os"
import path from "path"
import logger from "../lib/logger.js"

import knownFormats from "../lib/formats.js"
import Cache from "../lib/cache.js"

// load JSON files via require
import { createRequire } from "module"
const require = createRequire(import.meta.url)

const __dirname = new URL(".", import.meta.url).pathname

export default async function loadConfig({ NODE_ENV, CONFIG_FILE } = process.env) {

  const env = NODE_ENV || "development"
  const configFile = CONFIG_FILE
  || (env === "test" || env === "debug" ? `./config.${env}.json` : "./config.json")

  // Load default config
  const configDefault = require("./config.default.json")

  const { version, description } = require("../package.json")
  let config = { ...configDefault, version, description }


  // Load local config
  try {
    let configLocal = require(configFile)
    config = { ...config, ...configLocal }
  } catch(error) {
    const msg = `Could not load configuration file from ${configFile}.`
    if (CONFIG_FILE) {
      throw new Error(msg)
    } else {
      logger({level: config.verbosity}).warn(`Warning: ${msg} Running with default settings.`)
    }
  }

  const log = logger({level: env === "test" ? "silent" : config.verbosity})

  // Optionally load formats from file
  if (typeof config.formats === "string") {
    const formatsFile = config.formats
    config.formats = require(path.resolve(__dirname,formatsFile))
    log.info(`Formats loaded from ${formatsFile}`)
  }

  // knownFormats override configured formats
  config.formats = { ...config.formats, ...knownFormats }

  // initialize cache
  if (env === "test") {
    config.cachePath = path.join(os.tmpdir(), "validation-server-test")
  }
  const cachePath = path.resolve(__dirname, config.cachePath || "formats")
  const cache = new Cache(cachePath)
  const schemaFiles = {
    "https://format.gbv.de/validate/format-schema.json": "format-schema.json",
    "https://format.gbv.de/validate/config-schema.json": "config-schema.json",
    "https://json-schema.org/draft-07/schema": "json-schema-draft-07.json",
    "https://json-schema.org/draft-06/schema": "json-schema-draft-06.json",
    "https://json-schema.org/draft-04/schema": "json-schema-draft-04.json",
  }
  for (const [uri, file] of Object.entries(schemaFiles)) {
    await cache.put(uri, fs.readFileSync(path.resolve(__dirname, file)))
  }

  cache.keys().then(keys => log.info(`cachePath ${cachePath} contains ${keys.length} entries`))

  // validate configuration
  const url = "https://format.gbv.de/validate/config-schema.json"
  const validate = await knownFormats["json-schema"].createValidator({url, cache})
  const rawConfig = JSON.parse(JSON.stringify(config))

  const errors = validate(rawConfig)
  if (errors) {
    const msg =`Invalid configuration from ${configFile}`
    log.error(msg)
    errors.forEach(e => log.warn(e))
    log.debug(rawConfig)
    throw new Error(msg)
  }

  // additional fields for internal use
  config.configFile = path.resolve(__dirname, configFile)
  config.env = env
  config.cache = cache
  config.log = log

  return config
}

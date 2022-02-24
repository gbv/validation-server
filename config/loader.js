import fs from "fs"
import os from "os"
import path from "path"

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
      console.warn(`Warning: ${msg} Running with default settings.`)
    }
  }

  // Set up logging function
  config.log = (...args) => {
    if (env != "test" && config.verbosity === "log") {
      console.log(new Date(), ...args)
    }
  }
  config.warn = (...args) => {
    if (env != "test" && (config.verbosity === "log" || config.verbosity === "warn")) {
      console.warn(new Date(), ...args)
    }
  }
  config.error = (...args) => {
    if (env != "test" && config.verbosity !== "silent") {
      console.error(new Date(), ...args)
    }
  }

  // Optionally load formats from file
  if (typeof config.formats === "string") {
    const formatsFile = config.formats
    config.formats = require(path.resolve(__dirname,formatsFile))
    config.log(`Formats loaded from ${formatsFile}`)
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

  cache.keys().then(keys => config.log(`cachePath ${cachePath} contains ${keys.length} entries`))

  // validate configuration
  const url = "https://format.gbv.de/validate/config-schema.json"
  const validate = await knownFormats["json-schema"].createValidator({url, cache})
  const rawConfig = JSON.parse(JSON.stringify(config))

  const errors = validate(rawConfig)
  if (errors) {
    const msg =`Invalid configuration from ${configFile}`
    config.error(msg)
    errors.forEach(e => config.warn(e))
    // console.log(rawConfig)
    throw new Error(msg)
  }

  // additional fields for internal use
  for (let [id,value] of Object.entries(config.formats)) {
    value.id = id
  }
  config.configFile = path.resolve(__dirname, configFile)
  config.env = env
  config.cache = cache

  return config
}

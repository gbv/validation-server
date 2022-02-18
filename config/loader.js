import path from "path"

import parsers from "../lib/parsers.js"
import validators from "../lib/validators.js"

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
  const formatsFile = typeof config.formats === "string" ? config.formats : null
  if (formatsFile) {
    config.formats = require(formatsFile)
      // remove prefix "schema/" from schema languages
      .map(({id, ...format}) => ({id: id.replace(/^schema[/]/,""), ...format}))

    config.log(`Formats loaded from ${formatsFile}`)
  }

  // Add or override hard-coded formats and schema languages
  config.formats = config.formats.filter(({id}) => {
    if (id in parsers || id in validators) {
      console.warn(`Configured format ${id} is overridden by hardcoded format!`)
    } else {
      return true
    }
  })

  config.formats.push(...Object.values(parsers))
  config.formats.push(...Object.values(validators)
    .map(({ filename, ...format}) => format)) // eslint-disable-line no-unused-vars

  // validate configuration
  const schemaFile = path.resolve(__dirname, "schema.json")
  const validate = await validators["json-schema"].createValidator(schemaFile)
  const rawConfig = JSON.parse(JSON.stringify(config))

  if (!validate(rawConfig)) {
    const msg =`Invalid configuration from ${configFile}`
    config.error(msg)
    validate.errors.forEach(e => config.warn(e))
    // console.log(rawConfig)
    throw new Error(msg)
  }

  // additional fields for internal use
  config.configFile = path.resolve(__dirname, configFile)
  if (formatsFile) {
    config.formatsFile = path.resolve(__dirname, formatsFile)
  }
  config.env = env
  config.types = config.formats.filter(({id}) => id in validators)

  // get full path
  config.formatsDirectory = path.resolve(__dirname, config.formatsDirectory || "formats")

  return config
}

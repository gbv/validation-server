const path = require("path")

module.exports = ({ NODE_ENV, CONFIG_FILE }) => {

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
    console.warn(`Warning: Could not load configuration file from ${configFile}. Running with default settings.`)
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
    const filename = config.formats
    config.formats = require(filename)
    config.log(`Formats loaded from ${filename}`)
  }

  // Add or override hard-coded formats and schema languages
  const parsers = require("../lib/parsers.js")
  const validators = require("../lib/validators.js")

  config.formats = config.formats.filter(({id}) => {
    if (id in parsers || id in validators) {
      console.warn(`Configured format ${id} is overridden!`)
    } else {
      return true
    }
  })

  config.formats.push(...Object.values(parsers))
  config.formats.push(...Object.values(validators)
    .map(({ filename, ...format}) => format)) // eslint-disable-line no-unused-vars

  // validate configuration
  const compileJSONSchema = require("../lib/json-schema.js")
  const validate = compileJSONSchema(path.resolve(__dirname, "schema.json"))
  const rawConfig = JSON.parse(JSON.stringify(config)) // remove methods
  if (!validate(rawConfig)) {
    const msg =`Invalid configuration from ${configFile}`
    config.error(msg)
    validate.errors.forEach(e => config.warn(e))
    // console.log(rawConfig)
    throw new Error(msg)
  }

  // additional fields for internal use
  config.configFile = configFile
  config.env = env
  config.types = config.formats.filter(({id}) => id in validators)

  return config
}

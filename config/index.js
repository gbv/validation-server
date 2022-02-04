// Prepare environment
require("dotenv").config()
const env = process.env.NODE_ENV || "development"
const configFile = process.env.CONFIG_FILE || (env === "test" ? "./config.test.json" : "./config.json")

// Load default config
const configDefault = require("./config.default.json")

const { version, description } = require("../package.json")
let config = { ...configDefault, env, version, description }

// Load local config
try {
  let configLocal = require(configFile)
  config = { ...config, ...configLocal }
} catch(error) {
  console.warn(`Warning: Could not load configuration file from ${configFile}. Running with default settings.`)
}

// Hard-coded formats
config.formats.unshift({
  id: "json",
})


// Logging functions
if (![true, false, "log", "warn", "error"].includes(config.verbosity)) {
  console.warn(`Invalid verbosity value "${config.verbosity}", defaulting to "${configDefault.verbosity}" instead.`)
  config.verbosity = configDefault.verbosity
}

config.log = (...args) => {
  if (env != "test" && (config.verbosity !== true || config.verbosity === "log")) {
    console.log(new Date(), ...args)
  }
}
config.warn = (...args) => {
  if (env != "test" && (config.verbosity === true || config.verbosity === "log" || config.verbosity === "warn")) {
    console.warn(new Date(), ...args)
  }
}
config.error = (...args) => {
  if (env != "test" && config.verbosity !== false) {
    console.error(new Date(), ...args)
  }
}

module.exports = config

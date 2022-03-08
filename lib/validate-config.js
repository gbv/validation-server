// Directly use ajv to avoid async compilation of schemas

import fs from "fs"
import path from "path"
import Ajv from "ajv"
import ajvFormats from "ajv-formats"
import createLogger from "./logger.js"
import jsonSchema from "./format/json-schema.js"

const __dirname = new URL(".", import.meta.url).pathname
const readJSON = file => JSON.parse(fs.readFileSync(path.resolve(__dirname, file)))

const configSchema = readJSON("../public/config-schema.json")
const formatSchema = readJSON("../public/format-schema.json")
configSchema.properties.formats.anyOf[0].patternProperties["^[0-9a-z_/-]+$"] = formatSchema
const ajv = new Ajv()
ajvFormats(ajv)
const validator = ajv.compile(configSchema)

export default config => {
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

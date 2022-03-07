// To avoid async compilation of schemas directly use ajv

import fs from "fs"
import path from "path"
import Ajv from "ajv"
import ajvFormats from "ajv-formats"
import { ValidationError } from "./errors.js"

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
  const { env, logger, configFile, ...coreConfig } = config

  const rawConfig = JSON.stringify(coreConfig, null, "  ")
  logger.debug(rawConfig)

  if (validator(JSON.parse(rawConfig))) {
    return config
  } else {
    const msg =`Invalid configuration from ${configFile}`
    logger.error(msg)

    // FIXME: code duplicated in lib/validator/json-schema.js
    validator.errors.forEach(e =>
      logger.warn(new ValidationError({
        message: e.message || "Validation with JSON Schema failed",
        position: { jsonpointer: e.instancePath },
        details: e,
      })))

    throw new Error(msg)
  }
}

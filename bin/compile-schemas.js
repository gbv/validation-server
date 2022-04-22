import fs from "fs"
import path from "path"
import Ajv from "ajv"
import standaloneCode from "ajv/dist/standalone/index.js"

const __dirname = new URL(".", import.meta.url).pathname
const file = name => path.resolve(__dirname, name)
const jsonFile = name => JSON.parse(fs.readFileSync(file(name)))

const configSchema = jsonFile("../public/config-schema.json")
const formatSchema = jsonFile("../public/format-schema.json")
configSchema.properties.formats.anyOf[0].patternProperties["^[0-9a-z_/-]+$"] = formatSchema

const formats = { uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i }
const ajv = new Ajv({
  schemas: [configSchema],
  formats,
  code: {
    source: true,
    esm: true,
    formats,
    lines: true,
  },
})

const moduleCode = standaloneCode(ajv, {
  configValidation: "https://format.gbv.de/validate/config-schema.json",
  formatValidation: "https://format.gbv.de/validate/format-schema.json",
  // TODO: json-schema meta-schemas
})

const target = "../lib/compiled-schemas.js"
fs.writeFileSync(file(target), moduleCode)
console.log(`Updated ${target}`)

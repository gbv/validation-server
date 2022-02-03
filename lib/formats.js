const path = require("path")
const download = require("./download.js")
const Ajv = require("ajv")
const ajv = new Ajv()
const fs = require("fs")

const typeFile = {
  "json-schema": "json-schema.json",
  xsd: "xsd-schema.xml",
}

// const versionPattern = /^[a-zA-Z0-9.-]+$/
// const formatPattern = /^[a-zA-Z0-9-]+$/

module.exports = async config => {
  const { baseDirectory, formats, log } = config
  const formatRegistry = {}

  // requires formats to be valid!
  await Promise.all(formats.map(async ({id, schemas}) => {
    const versions = {}

    await Promise.all(schemas.map(async schema => {
      const { url, type, version } = schema
      const versionName = version || "default"
      const filename = typeFile[type]

      if (!filename) {
        throw new Error(`Unknown schema type ${type} in ${id} ${versionName}`)
      }

      if (!url) {
        throw new Error(`Missing url in ${id} ${versionName}`)
      }

      const file = path.join(baseDirectory, id, versionName, filename)

      log(`${url} => ${file}`)
      await download(url, file)

      schema.file = file

      if (type === "json-schema") {
        // TODO: compilation may fail
        const schemaData = JSON.parse(fs.readFileSync(file))
        schema.validator = ajv.compile(schemaData)
      }

      if (versionName in versions) {
        versions[versionName][type] = schema
      } else {
        versions[versionName] = { [type]: schema }
      }
    }))

    formatRegistry[id] = versions
  }))

  return {
    schema(query) {
      var { format, version, type } = query
      const versionName = version || "default"

      // TODO: don't hardcode type but infere from base
      type = "json-schema"

      if (format in formatRegistry) {
        if (versionName in formatRegistry[format]) {
          return formatRegistry[format][versionName][type]
        }
      }
    },
  }
}

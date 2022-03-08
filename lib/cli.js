import fs from "fs"
import os from "os"
import path from "path"
import getStdin from "get-stdin"

import { loadConfig, createService } from "../index.js"
import createLogger from "../lib/logger.js"

import meow from "meow"

const defaultConfig = path.resolve(process.env.XDG_CONFIG_HOME
  || `${os.homedir()}/.config`,"validate.json")

export default async function(argv, log) {
  const cli = meow(`
Usage
  $ validate [<format> [<files>...]]

Options
  --help, -h            Show this help
  --config, -c FILE     Set configuration file (${defaultConfig})
  --formats, -f FILE    Set formats file
  --query, -q QUERY     Validate records within the data
  --schema, -s          Return schema file (no validation)
  --verbosity, -v LEVEL Set log level (debug, info, warn, error=default, silent)
  --list, -l            List configured formats

Examples
  $ validate json-schema schema.json
  $ echo {} | validate json
  $ validate -c config.json json < input.json
  $ validate -s json-schema@draft-07
`, {
    importMeta: import.meta,
    argv,
    pkg: {
      description: "Validate data in several formats",
    },
    flags: {
      help: {
        type: "boolean",
        alias: "h",
      },
      formats: {
        type: "string",
        alias: "f",
      },
      config: {
        type: "string",
        alias: "c",
      },
      query: {
        type: "string",
        alias: "q",
      },
      verbosity: {
        type: "string",
        alias: "v",
        default: "error",
      },
      list: {
        type: "boolean",
        alias: "l",
      },
      schema: {
        type: "boolean",
        alias: "s",
      },
    },
  })

  const { flags, input } = cli

  /* c8 ignore next 4 */
  if (flags.help) {
    cli.showHelp()
    return
  }

  var logger
  if (flags.verbosity.match(/^(silent|error|warn|info|debug)$/)) {
    logger = createLogger({ level: flags.verbosity })
  } else {
    throw new Error("Invalid verbosity level")
  }

  const configFile = flags.config ? path.resolve(flags.config, "./") :
    (fs.existsSync(defaultConfig) ? defaultConfig : null)
  const config = loadConfig(configFile, logger)
  const service = await createService(config)

  if (flags.list) {
    const formats = service.listFormats()
    formats.forEach(f => log(f.id))
    return
  }

  if (!input.length) {
    throw new Error("Missing first argument <format>")
  }

  if (input.length < 2) {
    input.push("-")
  }

  if (flags.formats) {
    throw new Error("--formats not supported yet")
  }

  const formatName = input.shift()
  const [ formatId, version ] = formatName.split("@")

  const format = service.getFormat(formatId, { version })
  if (!format) {
    throw new Error(`Format not found: ${formatName}`)
  }

  if (flags.schema) {
    const schema = await service.promiseSchema(format)
    if (schema.value) {
      log(schema.value)
    } else {
      log(fs.readFileSync(schema.file.path).toString())
    }
    return
  }

  var errors = 0

  for (let file of input) {
    const source = (file === "-" ? getStdin() : fs.promises.readFile(file))

    await source.then(data => {
      format.validateAll(data, flags.query)
        .forEach(result => {
          log(result === true ? "ok" : result)
          if (result !== true) errors++
        })
    })
  }

  return errors ? 1 : 0
}

import fs from "fs/promises"
import path from "path"
import getStdin from "get-stdin"

import { loadConfig, createService } from "../index.js"
import createLogger from "../lib/logger.js"

import meow from "meow"

export default async function(argv, log) {
  const cli = meow(`
Usage
  $ validate [<format> [<files>...]]

Options
  --help, -h            Show this help
  --formats, -f FILE    Set formats file
  --config, -c FILE     Set configuration file
  --cachepath, -p DIR   Set cachePath (use - for temporary directory)
  --verbosity, -v LEVEL Set log level (debug, info, warn, error=default, silent)
  --list, -l            List configured formats

Examples
  $ validate json-schema schema.json
  $ echo {} | validate json
  $ validate -c config.json json < input.json
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
      cachepath: {
        type: "string",
        alias: "p",
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
      config: {
        type: "string",
        alias: "c",
        default: process.env.CONFIG_FILE || "",
      },
    },
  })

  const { flags, input } = cli

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

  const CONFIG_FILE = flags.config ? path.resolve(flags.config, "./") : null
  const config = await loadConfig({ ...process.env, CONFIG_FILE, logger })
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

  // TODO: support flags.formats and flags.cachepath
  const formatName = input.shift()
  const format = service.getFormat(formatName)
  if (!format) {
    throw new Error(`Format ${formatName} not supported`)
  }

  var errors = 0

  for (let file of input) {
    const getData = file === "-" ? getStdin() : fs.readFile(file)

    getData
      .then(data => format.valid(data))
      .then(() => {
        log("ok")
      })
      .catch(e => {
        errors++
        if (e.errors) {
          for (let error of e.errors) {
            log(error)
          }
          errors++
        } else {
          throw new Error(e.message)
        }
      })
  }

  return errors ? 1 : 0
}

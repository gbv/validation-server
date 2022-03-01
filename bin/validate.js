#!/usr/bin/env node

import fs from "fs"
import path from "path"

import { loadConfig, createService } from "../index.js"
import createLogger from "../lib/logger.js"

import meow from "meow"
const cli = meow(`
Usage
  $ validate <format> [<files>...]

Options
  --help, -h            Show this help
  --formats, -f FILE    Set formats file
  --config, -c FILE     Set configuration file
  --cachepath, -p DIR   Set cachePath (use - for temporary directory)
  --verbosity, -v LEVEL Set log level (debug, info, warn, error, silent)
  --list, -l            List configured formats

Examples
  $ validate -c config.json json < input.json
  $ validate json-schema schema.json
  $ echo {} | validate json

`, {
  importMeta: import.meta,
  pkg: {
    description: "Validate data in several formats",
  },
  flags: {
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
  process.exit(0)
}

var logger
if (flags.verbosity) {
  if (flags.verbosity.match(/^(silent|error|warn|info|debug)$/)) {
    logger = createLogger({ level: flags.verbosity })
  } else {
    console.error("Invalid verbosity level")
    process.exit(2)
  }
}

const CONFIG_FILE = flags.config ? path.resolve(flags.config, "./") : null
const config = await loadConfig({ CONFIG_FILE, logger })
const service = await createService(config)

if (flags.list) {
  const formats = service.listFormats()
  formats.forEach(f => console.log(f.id))
  process.exit(0)
}

if (!input.length) {
  console.error("Missing argument: <format>")
  process.exit(2)
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
for (let file of input) {
  const data = fs.readFileSync(file)
  format.valid(data)
    .then(() => {
      console.log("ok")
    })
    .catch(e => {
      if (e.errors) {
        for (let error of e.errors) {
          console.log(error)
        }
        process.exit(1)
      } else {
        console.error(e.message)
        process.exit(2)
      }
    })
}

#!/usr/bin/env node

import fs from "fs"
import path from "path"

import { loadConfig, createService } from "../index.js"

import meow from "meow"
const cli = meow(`
To not break things, update into a new cache and move it afterwards.

Options
  --help, -h           Show this help
  --formats, -f FILE   Set formats file
  --directory, -d DIR  Set cache (use - for temporary directory)

Examples
  $ CONFIG_FILE=config.json npm run update -d -
  $ npm run update -- --f newformats.json --d newformats/
`, {
  importMeta: import.meta,
  pkg: {
    description: "Update schema files from configuration",
  },
  flags: {
    formats: {
      type: "string",
      alias: "f",
      default: "",
    },
    directory: {
      type: "string",
      alias: "l",
      default: "",
    },
    help: {
      type: "boolean",
      alias: "h",
      default: false,
    },
  },
})

const { flags } = cli

if (flags.help) {
  cli.showHelp()
  process.exit(0)
}

const config = loadConfig()
const formatFile = flags.formats
  ? path.resolve("./", flags.formats)
  : config.formatsFile
const formats = JSON.parse(fs.readFileSync(formatFile))

const cache = flags.directory === "-" ? false : (flags.directory || config.cache)
createService({ ...config, formats, cache })
  .then(() => {
    process.exit()
  })

#!/usr/bin/env node

import fs from "fs"
import os from "os"
import path from "path"

import { loadConfig, createService } from "./index.js"

import meow from "meow"
const cli = meow(`
To not break things, update into a new formatsDirectory and move it afterwards.

Options
  --help, -h           Show this help
  --formats, -f FILE   Set formats file
  --directory, -d DIR  Set formatsDirectory (use - for temporary directory)

Examples
  $ CONFIG_FILE=config.json npm run update -d -
  $ npm run update -- --f newformats.json --d newformats/
`, {
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

const formats = flags.formats
  ? path.resolve("./", flags.formats)
  : config.formatsFile

const formatsDirectory = flags.directory === "-"
  ? fs.mkdtempSync(path.join(os.tmpdir(),"validation-server-"))
  : (flags.directory || config.formatsDirectory)

const update = "startup"

createService({ ...config, update, formats, formatsDirectory })
  .then(() => {
    process.exit()
  })

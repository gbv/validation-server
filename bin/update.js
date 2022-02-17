#!/usr/bin/env node

const configLoader = require("../config/loader.js")
const compileFormats = require("../lib/formats")
const fs = require("fs")
const os = require("os")
const path = require("path")

const meow = require("meow")
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

const config = configLoader(process.env)

const formats = flags.formats
  ? path.resolve("./", flags.formats)
  : config.formatsFile

const formatsDirectory = flags.directory === "-"
  ? fs.mkdtempSync(path.join(os.tmpdir(),"validation-server-"))
  : (flags.directory || config.formatsDirectory)

const update = "startup"

compileFormats({ ...config, update, formats, formatsDirectory })
  .then(() => {
    process.exit()
  })

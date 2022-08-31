/* eslint-env node, mocha */
import { expect, formatIds } from "./test.js"

import { knownFormats } from "../lib/formats.js"
import validate from "../lib/cli.js"

// make sure local default config file is not load accidentally
process.env.XDG_CONFIG_HOME = "/dev/null"

describe("validate CLI", () => {

  const cli = async (...args) => {
    const out = []
    return validate(args, msg => out.push(msg)).then(() => out)
  }

  it("should not accept invalid options/arguments", () => {
    return Promise.all([
      expect(cli()).to.be.rejectedWith("Missing first argument <format>"),
      expect(cli("-x")).to.be.rejected,
      expect(cli("-v","x")).to.be.rejectedWith("Invalid verbosity level"),
      expect(cli("-c","mising-file.json")).to.be.rejected,
      expect(cli("xxx","y")).to.be.rejectedWith("Format not found: xxx"),
    ])
  })

  it("list known formats without config file", () => {
    return cli("-l").then(out => {
      expect(out).to.deep.equal(Object.keys(knownFormats).sort())
    })
  })

  it("list formats from config file with -l", () => {
    return cli("-l","-c","./config/config.test.json").then(out => {
      expect(out).to.deep.equal(formatIds)
    })
  })

  it("validate a file", () => {
    return cli("json-schema","./public/format-schema.json")
      .then(out => expect(out).to.deep.equal(["true"]))
  })
})

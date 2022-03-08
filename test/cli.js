/* eslint-env node, mocha */
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

import formats from "../lib/formats.js"
import validate from "../lib/cli.js"

// make sure local default config file is not load accidentally
process.env.XDG_CONFIG_HOME = "/dev/null"

describe("validate CLI", () => {

  const cli = async (...args) => {
    const out = []
    return validate(args, msg => out.push(msg)).then(() => out)
  }

  it("should not accept invalid options/arguments", () => {
    expect(cli()).to.be.rejectedWith("Missing first argument <format>")
    expect(cli("-x")).to.be.rejected
    expect(cli("-v","x")).to.be.rejectedWith("Invalid verbosity level")
    expect(cli("-c","mising-file.json")).to.be.rejected
    expect(cli("xxx","y")).to.be.rejectedWith("Format not found: xxx")
  })

  it("list known formats without config file", () => {
    return cli("-l").then(out => {
      expect(out).to.deep.equal(Object.keys(formats).sort())
    })
  })

  it("list formats from config file with -l", () => {
    return cli("-l","-c","./config/config.test.json").then(out => {
      expect(out).to.deep.equal([
        "about/data",
        "array",
        "digits",
        "isbn",
        "json",
        "json-schema",
        "regexp",
        "xml"])
    })
  })

  it("validate a file", () => {
    return cli("json-schema","./public/format-schema.json")
      .then(out => expect(out).to.deep.equal(["ok"]))
  })
})
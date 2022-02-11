/* eslint-env node, mocha */
const chai = require("chai")
const path = require("path")
const expect = chai.expect

const loader = require("../config/loader.js")

describe("Configuration", () => {
  it("should throw an error on invalid configuration", done => {
    const CONFIG_FILE = path.resolve(__dirname, "config-invalid.json")
    expect(function() {
      console.log(loader({CONFIG_FILE, ...process.env}))
    }).to.throw(`Invalid configuration from ${CONFIG_FILE}`)
    done()
  })
})

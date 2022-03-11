/* eslint-env node, mocha */
import path from "path"

import { loadConfig } from "../index.js"

import { URL } from "url"
const __dirname = new URL(".", import.meta.url).pathname

import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

describe("Configuration", () => {
  it("should throw an error on missing configuration file", () => {
    const file = path.resolve(__dirname, "config-missing.json")
    expect(() => loadConfig(file)).to.throw(`Failed to load configuration from ${file}`)
  })

  it("should throw an error on invalid configuration", () => {
    const file = path.resolve(__dirname, "files/config-invalid.json")
    expect(() => loadConfig(file)).to.throw(`Invalid configuration from ${file}`)
  })
})

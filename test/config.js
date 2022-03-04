/* eslint-env node, mocha */
import path from "path"

import { loadConfig } from "../index.js"

import { URL } from "url"
const __dirname = new URL(".", import.meta.url).pathname

import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const assert = chai.assert

describe("Configuration", () => {
  it("should throw an error on missing configuration file", async () => {
    const file = path.resolve(__dirname, "config-missing.json")
    return assert.isRejected(
      loadConfig(file),
      `Failed to load configuration from ${file}`,
    )
  })

  it("should throw an error on invalid configuration", async () => {
    const file = path.resolve(__dirname, "config-invalid.json")
    return assert.isRejected(
      loadConfig(file),
      `Invalid configuration from ${file}`,
    )
  })
})

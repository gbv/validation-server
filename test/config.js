/* eslint-env node, mocha */
import { expect } from "chai"
import path from "path"

import { loadConfig } from "../index.js"

import { URL } from "url"
const __dirname = new URL(".", import.meta.url).pathname

describe("Configuration", () => {
  it("should throw an error on invalid configuration", done => {
    const CONFIG_FILE = path.resolve(__dirname, "config-invalid.json")
    expect(function() {
      loadConfig({CONFIG_FILE, ...process.env})
    }).to.throw(`Invalid configuration from ${CONFIG_FILE}`)
    done()
  })
})

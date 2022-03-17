/* eslint-env node, mocha */
import { expect, file } from "./test.js"
import { loadConfig } from "../index.js"

describe("Configuration", () => {
  it("should throw an error on missing configuration file", () => {
    const path = file("files/config-missing.json")
    expect(() => loadConfig(path)).to.throw(`Failed to load configuration ${path}`)
  })

  it("should throw an error on invalid configuration", () => {
    [1,2].map(n => file(`files/config-invalid-${n}.json`))
      .forEach(path => expect(() => loadConfig(path)).to.throw(`Invalid configuration ${path}`))
  })
})

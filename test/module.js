/* eslint-env node, mocha */
import { createService, loadConfig, validationFormats, parsedFormats, knownFormats } from "../index.js"

import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

describe("Module", () => {

  it("should export functions", done => {
    expect(createService).to.be.instanceOf(Function)
    expect(loadConfig).to.be.instanceOf(Function)
    done()
  })

  it("should export formats", done => {
    expect(knownFormats).to.be.instanceOf(Object)
    expect(parsedFormats).to.be.instanceOf(Object)
    expect(validationFormats).to.be.instanceOf(Object)
    done()
  })

})

describe("parsedFormats", () => {

  it("should include json parser", async () => {
    const { json } = parsedFormats
    expect(json.title).to.equal("JSON")

    return Promise.all([
      expect(json.parse("[null,42]")).to.eventually.deep.equal([null,42]),
      // TODO: don't return array of object
      expect(json.parse("{\"x\":1}")).to.eventually.deep.equal([{x:1}]),
      expect(json.parse("{")).to.be.rejected,
    ])
  })

})

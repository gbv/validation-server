/* eslint-env node, mocha */
const chai = require("chai")
const expect = chai.expect

const { createService } = require("../index.js")
const config = require("../config/loader.js")(process.env)

var formats

describe("Formats", () => {

  before(async () => {
    formats = await createService(config)
  })

  it("should get specific version", () => {
    const version = "draft-06"
    const result = formats.getFormat({ format: "json-schema", version })
    expect(result.schemas.length).to.equal(1)
    expect(result.schemas[0].version).to.equal(version)
  })

  it("should get default version", () => {
    const result = formats.getFormat({ format: "json-schema" })
    expect(result.schemas.length).to.equal(1)
    expect(result.schemas[0].version).to.equal("draft-07")
  })

})

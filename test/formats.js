/* eslint-env node, mocha */
const chai = require("chai")
const config = require("../config")
const expect = chai.expect

var formats

describe("Formats", () => {

  before(async () => {
    formats = await require("../lib/formats")(config)
  })

  it("should get specific version", () => {
    const version = "draft-06"
    const result = formats.getSpecificFormat({ format: "json-schema", version })
    expect(result.schemas.length).to.equal(1)
    expect(result.schemas[0].version).to.equal(version)
  })

  it("should get default version", () => {
    const result = formats.getSpecificFormat({ format: "json-schema" })
    expect(result.schemas.length).to.equal(1)
    expect(result.schemas[0].version).to.equal("draft-07")
  })

})
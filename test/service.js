/* eslint-env node, mocha */
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

import { loadConfig, createService } from "../index.js"

const config = await loadConfig()
const service = await createService(config)

describe("ValidationService", () => {

  it("should listFormats", () => {
    const formats = service.listFormats()
    expect(formats.map(f => f.id)).deep.equal([
      "array",
      "digits",
      "isbn",
      "json",
      "json-schema",
      "regexp",
    ])
  })

  it("should listLanguages", () => {
    const formats = service.listLanguages()
    expect(formats.map(f => f.id)).deep.equal([
      "json-schema",
      "regexp",
    ])
  })

  it("should getFormat specific version", () => {
    const version = "draft-06"
    const result = service.getFormat("json-schema", { version })
    expect(Object.keys(result.versions)).to.deep.equal(["draft-06"])
  })

  it("should getFormat default version", () => {
    var result = service.getFormat("json-schema")
    expect(Object.keys(result.versions)).to.deep.equal(["draft-07"])

    result = service.getFormat("json-schema", { version: "default" })
    expect(Object.keys(result.versions)).to.deep.equal(["draft-07"])
  })

  it("should include json-schema as format", () => {
    const format = service.getFormat("json-schema")
    expect(format.validate).to.be.instanceOf(Function)

    // .validate
    expect(format.validate({})).to.be.null

    // expect(format.validate("{}")).to.be.null // TODO
    expect(format.validate([])).to.be.instanceOf(Array)
  })

  it("should include regexp as format", () => {
    const format = service.getFormat("regexp")

    // .validate
    expect(format.validate("^a+")).to.be.null
    expect(format.validate("[")).to.be.instanceOf(Array)

    // .valid
    expect(format.valid("^a+")).to.eventually.equal("^a+")
    expect(format.valid("[")).to.be.rejected
  })

  it("should support a format defined by regexp", () => {
    const format = service.getFormat("digits")

    expect(format.validate("123\n456\n")).to.be.null
    expect(format.validate("xy")).to.deep.equal([{
      message: "Value does not match regular expression",
    }])
  })

  it("should support a format with parser only", () => {
    const format = service.getFormat("isbn")

    expect(format.validate("978-3-16-148410-0")).to.be.null
    expect(format.validate("978-3-16-148410-1")).to.deep.equal([{
      message: "Invalid ISBN",
    }])
  })

  it("should validate from Buffer and String", () => {
    const format = service.getFormat("json")

    expect(format.validate("{}")).to.be.null
    expect(format.validate("[")).to.be.instanceOf(Array)
    expect(format.validate(new Buffer("{}"))).to.be.null
  })
})

/* eslint-env node, mocha */
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

import { loadConfig, createService } from "../index.js"

const config = loadConfig()
const service = await createService(config)

describe("ValidationService", () => {

  it("should listFormats", () => {
    const formats = service.listFormats()
    expect(formats.map(f => f.id)).deep.equal([
      "about/data",
      "array",
      "digits",
      "isbn",
      "json",
      "json-schema",
      "regexp",
      "xml",
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

    // .validate
    expect(format.validate({})).to.be.null

    expect(format.validate("{}")).to.be.null
    expect(format.validate([])).to.be.instanceOf(Array)

    expect(format.validate("[")).to.deep.equal([
      {
        message: "Unexpected end of JSON input",
        position: { rfc5147: "char=1" },
      },
    ])

  })

  it("should include regexp as format", () => {
    const format = service.getFormat("regexp")

    // .validate
    expect(format.validate("^a+")).to.be.null
    expect(format.validate("[")).to.be.instanceOf(Array)

    // .validateAll
    expect(() => format.validateAll(".","")).to.throw("Validator does not support selection")
    expect(format.validateAll(".")).to.deep.equal([true])
    expect(format.validateAll("[")[0]).to.be.instanceOf(Array)

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
    expect(() => format.validateAll("","")).to.throw("Validator does not support selection")
  })

  it("should support a format with parser only", () => {
    const format = service.getFormat("isbn")

    expect(format.validate("978-3-16-148410-0")).to.be.null
    expect(format.validate("978-3-16-148410-1")).to.deep.equal([{
      message: "Invalid ISBN",
    }])
    expect(() => format.validateAll("","")).to.throw("Validator does not support selection")
  })

  it("should support parsing JSON", () => {
    const format = service.getFormat("json")
    expect(format.validate("[]")).to.be.null
    expect(format.validate("{")).to.deep.equal([{
      message: "Unexpected end of JSON input",
      position: { rfc5147: "char=1" },
    }])
    expect(format.validate("{ 1")).to.deep.equal([{
      message: "Unexpected number in JSON at position 2",
      position: { rfc5147: "char=2" },
    }])
  })

  it("should support parsing XML", () => {
    const format = service.getFormat("xml")

    expect(format.validate("<x:y/>")).to.be.null
    expect(format.validate("<x>\n<y>\n</x>")).to.deep.equal([{
      message: "Expected closing tag 'y' (opened in line 2, col 1) instead of closing tag 'x'.",
      position: {
        rowcol: "3,1",
      },
    }])
  })

  it("should validate from Buffer and String", () => {
    const format = service.getFormat("json")

    expect(format.validate("{}")).to.be.null
    expect(format.validate("[")).to.be.instanceOf(Array)
    expect(format.validate(new Buffer("{}"))).to.be.null
  })
})

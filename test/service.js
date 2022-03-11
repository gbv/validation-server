/* eslint-env node, mocha */
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

import { Readable } from "stream"
import toArray from "stream-to-array"

import { loadConfig, createService } from "../index.js"

import fs from "fs"
import path from "path"
const __dirname = new URL(".", import.meta.url).pathname
const readJSON = file => JSON.parse(fs.readFileSync(path.resolve(__dirname, file)))

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
      "jskos",
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
    expect(format.validSync({})).to.be.null

    expect(format.validSync("{}")).to.be.null
    expect(format.validSync([])).to.be.instanceOf(Array)

    expect(format.validSync("[")).to.deep.equal([
      {
        message: "Unexpected end of JSON input",
        position: { rfc5147: "char=1" },
      },
    ])


  })

  it("should include regexp as format", async () => {
    const format = service.getFormat("regexp")
    const errors = [ { message: "Invalid regular expression: /?/: Nothing to repeat" } ]

    // .validateAll
    expect(() => format.validateAll(".","")).to.throw("Validator does not support selection")
    expect(format.validateAll(".")).to.deep.equal([true])
    expect(format.validateAll("?")[0]).to.be.instanceOf(Array)

    // .valid
    expect(format.valid("^a+")).to.eventually.equal("^a+")
    await expect(format.valid("?")).to.be.rejected.then(e =>
      expect(e).to.deep.equal({ message: "Invalid data", errors }))

    // .validSync
    expect(format.validSync("^a+")).to.be.null
    expect(format.validSync("?")).to.deep.equal(errors)

    // .validateStream
    return toArray(Readable.from(["^a+","?"]).pipe(format.validateStream))
      .then(result => expect(result).to.deep.equal([ true, errors ]))
  })

  it("should support a format defined by regexp", () => {
    const format = service.getFormat("digits")

    expect(format.validSync("123\n456\n")).to.be.null
    expect(format.validSync("xy")).to.deep.equal([{
      message: "Value does not match regular expression",
    }])
    expect(() => format.validateAll("","")).to.throw("Validator does not support selection")
  })

  it("should support a format with parser only", () => {
    const format = service.getFormat("isbn")

    expect(format.validSync("978-3-16-148410-0")).to.be.null
    expect(format.validSync("978-3-16-148410-1")).to.deep.equal([{
      message: "Invalid ISBN",
    }])
    expect(() => format.validateAll("","")).to.throw("Validator does not support selection")
  })

  it("should support parsing JSON", () => {
    const format = service.getFormat("json")
    expect(format.validSync("[]")).to.be.null
    expect(format.validSync("{")).to.deep.equal([{
      message: "Unexpected end of JSON input",
      position: { rfc5147: "char=1" },
    }])
    expect(format.validSync("{ 1")).to.deep.equal([{
      message: "Unexpected number in JSON at position 2",
      position: { rfc5147: "char=2" },
    }])
  })

  it("should support parsing XML", () => {
    const format = service.getFormat("xml")

    expect(format.validSync("<x:y/>")).to.be.null
    expect(format.validSync("<x>\n<y>\n</x>")).to.deep.equal([{
      message: "Expected closing tag 'y' (opened in line 2, col 1) instead of closing tag 'x'.",
      position: {
        rowcol: "3,1",
      },
    }])
  })

  it("should support validating JSKOS", () => {
    const format = service.getFormat("jskos")

    ;[
      {},
      {uri:"https://example.org"},
      {prefLabel:{en:"x"},type:["http://www.w3.org/2004/02/skos/core#Concept"]},
    ].forEach(ok => expect(format.validSync(JSON.stringify(ok))).to.be.null)

    expect(format.validSync("{\"uri\":0}")).to.deep.equal([{
      message: "must be string",
      position: { jsonpointer: "/uri" },
    }])

    const input = readJSON("files/jskos.json")
    const errors = readJSON("files/jskos-errors.json")
    expect(format.validateAll(input, "$.*")).to.deep.equal(errors)

    // FIXME: validateStream stream is not persistent
    // return toArray(Readable.from(input).pipe(format.validateStream))
    //  .then(result => expect(result).to.deep.equal([ true, error ]))
  })

  it("should validate from Buffer and String", () => {
    const format = service.getFormat("json")

    expect(format.validSync("{}")).to.be.null
    expect(format.validSync("[")).to.be.instanceOf(Array)
    expect(format.validSync(new Buffer("{}"))).to.be.null
  })
})

/* eslint-env node, mocha */
import { expect, jsonFile } from "./test.js"

import { Readable } from "stream"
import toArray from "stream-to-array"

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
      "jskos",
      "json",
      "json-schema",
      "regexp",
      "xml",
      "xsd",
    ])
  })

  it("should listLanguages", () => {
    const formats = service.listLanguages()
    expect(formats.map(f => f.id)).deep.equal([
      "json-schema",
      "regexp",
      "xsd",
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

  it("should include regexp as format", async () => {
    const format = service.getFormat("regexp")
    const errors = [ { message: "Invalid regular expression: /?/: Nothing to repeat" } ]

    // .validateAll
    await expect(format.validateAll(".")).to.eventually.deep.equal([true])
    await expect(format.validateAll("?")).to.eventually.deep.equal([errors])

    // .validateStream
    return toArray(Readable.from(["^a+","?"]).pipe(format.validateStream))
      .then(result => expect(result).to.deep.equal([ true, errors ]))
  })

  const serviceTests = {
    "json-schema": {
      valid: [
        "{\"type\":\"array\"}",             // pass JSON string
        new Buffer("{\"type\":\"array\"}"), // pass Buffer
        {type:"array"},                     // pass JSON object
      ],
      invalid: {
        "[": [
          {
            message: "Unexpected end of JSON input",
            position: { rfc5147: "char=1" },
          },
        ],
        "[]": [
          {
            message: "must be object,boolean",
            position: { jsonpointer: "" },
          },
        ],
      },
    },
    regexp: {
      valid: ["^a+"],
      invalid: {
        "?": [{ message: "Invalid regular expression: /?/: Nothing to repeat" }],
      },
    },
    digits: { // example of a format defined by regexp
      valid: ["123\n456\n"],
      invalid: {
        xy: [{
          message: "Value does not match regular expression",
        }],
      },
    },
    isbn: { // example of a format defined by parser
      valid: ["978-3-16-148410-0"],
      invalid: {
        "978-3-16-148410-1": [{ message: "Invalid ISBN" }],
      },
    },
    json: {
      valid: [
        "[]",
        "{}",
      ],
      invalid: {
        "{": [{
          message: "Unexpected end of JSON input",
          position: { rfc5147: "char=1" },
        }],
        "{ 1": [{
          message: "Unexpected number in JSON at position 2",
          position: { rfc5147: "char=2" },
        }],
      },
    },
    xml: {
      valid: ["<x:y/>"],
      invalid: {
        "<x>\n<y>\n</x>":     [{
          message: "Expected closing tag 'y' (opened in line 2, col 1) instead of closing tag 'x'.",
          position: {
            rfc5147: "line=3",
          },
        }],
      },
    },
    jskos: {
      valid: [
        {},
        {uri:"https://example.org"},
        "{\"uri\":\"https://example.org\"}",
        {prefLabel:{en:"x"},type:["http://www.w3.org/2004/02/skos/core#Concept"]},
      ],
      invalid: {
        "{\"uri\":0}": [{
          message: "must be string",
          position: { jsonpointer: "/uri" },
        }],
      },
    },
  }

  Object.entries(serviceTests).forEach(([name, { valid, invalid }]) => {
    const format = service.getFormat(name)
    if (valid) {
      it(`should pass valid ${name}`, () =>
        Promise.all(valid.map(value =>
          expect(format.valid(value)).to.eventually.equal(value),
        )),
      )
    }
    if (invalid) {
      it(`should detect invalid ${name}`, () =>
        Promise.all(Object.entries(invalid).map(([value, errs]) =>
          expect(format.valid(value)).to.be.rejected
            .then(({errors}) => expect(errors).to.deep.equal(errs)),
        )),
      )
    }
  })

  it("should complain validate with selection if format doesn't support selection", () => {
    return Promise.all(["regexp", "isbn", "isbn"].map(name => {
      const format = service.getFormat(name)
      return expect(format.validateAll("","")).to.be.rejected
        .then(e => expect(e.message).to.equal("Validator does not support selection"))
    }))
  })

  it("should support validating JSKOS", () => {
    const format = service.getFormat("jskos")

    const input = jsonFile("files/jskos.json")
    const errors = jsonFile("files/jskos-errors.json")
    return expect(format.validateAll(input, "$.*")).to.eventually.deep.equal(errors)

    // FIXME: validateStream stream is not persistent
    // return toArray(Readable.from(input).pipe(format.validateStream))
    //  .then(result => expect(result).to.deep.equal([ true, error ]))
  })
})

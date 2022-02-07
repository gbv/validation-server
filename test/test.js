/* eslint-env node, mocha */

const fs = require("fs")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const chaiHttp = require("chai-http")
chai.use(chaiHttp)
// eslint-disable-next-line no-unused-vars
const should = chai.should()

const server = require("../server")
const config = require("../config")

const request = path => chai.request(server.app).get(path)

describe("Server", () => {

  before(async () => {
    const formats = await require("../lib/formats")(config)
    server.app.set("formats", formats)
  })

  it("should show HTML on base URL", done => {
    request("/")
      .end((err, res) => {
        res.should.have.status(200)
        res.text.should.match(/<body/)
        done()
      })
  })

  it("should list formats at /formats", done => {
    request("/formats")
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a("array")
        done()
      })
  })

  it("should return a schemas at /schema", done => {
    request("/schema?format=json-schema&version=draft-07")
      .end((err, res) => {
        res.should.have.status(200)
        const draft7 = "test/formats/json-schema/draft-07/schema.json"
        res.body.should.deep.equal(JSON.parse(fs.readFileSync(draft7)))
        done()
      })
  })

  it("should list schema types at /types", done => {
    request("/types")
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a("array")
        done()
      })
  })

  it("should require a format parameter at /validate", done => {
    request("/validate")
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a("object")
        done()
      })
  })

  const validationTests = [
    { format: "json", data: "[]", code: 200, result: [] },
    { format: "json", data: "{}", code: 200, result: [true] },
    { format: "json", data: "[false]", code: 200, result: [true] },
    { format: "json", data: "null", code: 200, result: [true] },
    { format: "json", data: "{", code: 200,
      result: [[{error: "SyntaxError", message: "Unexpected end of JSON input" }]],
    },
    { format: "json-schema", data: "{", code: 200,
      result: [[{error: "SyntaxError", message: "Unexpected end of JSON input" }]],
    },
  ]

  validationTests.forEach(({format, data, code, result}) => {
    it(`should validate ${format} data ${data}`, done => {
      request(`/validate?format=${format}&data=${data}`)
        .end((err, res) => {
          res.should.have.status(code)
          res.body.should.deep.equal(result)
          done()
        })
    })
  })

})

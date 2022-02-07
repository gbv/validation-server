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

})

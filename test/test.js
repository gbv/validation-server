/* eslint-env node, mocha */

const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const chaiHttp = require("chai-http")
chai.use(chaiHttp)
// eslint-disable-next-line no-unused-vars
const should = chai.should()

const server = require("../server")
const config = require("../config")

describe("Server", () => {

  before(async () => {
    const formats = await require("../lib/formats")(config)
    server.app.set("formats", formats)
  })

  it("should show HTML on base URL", done => {
    chai.request(server.app).get("/")
      .end((err, res) => {
        res.should.have.status(200)
        res.text.should.match(/<body/)
        done()
      })
  })

  it("should list formats at /formats", done => {
    chai.request(server.app)
      .get("/formats")
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a("array")
        done()
      })
  })
})

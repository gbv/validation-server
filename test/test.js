/* eslint-env node, mocha */

const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const chaiHttp = require("chai-http")
chai.use(chaiHttp)

// eslint-disable-next-line no-unused-vars
const should = chai.should()
const server = require("../server")

describe("Server", () => {
  // it("should show HTML on base URL", done => {
  // })

  it("should list formats at /formats", done => {
    chai.request(server.app)
      .get("/status")
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a("array")
        done()
      })
  })
})

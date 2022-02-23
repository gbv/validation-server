/* eslint-env node, mocha */
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

import { loadConfig, createService } from "../index.js"

const config = await loadConfig()
const service = await createService(config)

describe("ValidationService", () => {

  it("should get specific version", () => {
    const version = "draft-06"
    const result = service.getFormat({ format: "json-schema", version })
    expect(result.schemas.length).to.equal(1)
    expect(result.schemas[0].version).to.equal(version)
  })

  it("should get default version", () => {
    const result = service.getFormat({ format: "json-schema" })
    expect(result.schemas.length).to.equal(1)
    expect(result.schemas[0].version).to.equal("draft-07")
  })

  // FIXME
  /*
  it("should support regexp as format", () => {
    const regexp = service.getFormat({ format: "regexp" })
    console.log(regexp)
    expect(regexp.validator("^a+")).to.be.true
  })*/

  it("should support formats defined by regexp", () => {
    const digits = service.getFormat({ format: "digits" })
    const { validator } = digits.schemas[0]

    expect(validator("123\n456\n")).to.be.null
    expect(validator("xy")).to.deep.equal([{
      message: "Value does not match regular expression",
    }])
  })

})

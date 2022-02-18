/* eslint-env node, mocha */
import { expect } from "chai"
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

})

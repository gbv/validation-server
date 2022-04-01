/* eslint-env node, mocha */
import { chai, expect, file, jsonFile } from "./test.js"
import moxios from "moxios"
import chaiHttp from "chai-http"
chai.use(chaiHttp)

import { loadConfig, createService } from "../index.js"

const config = loadConfig()
const formats = await createService(config)

import app from "../server.js" // TODO: await start
app.set("formats", formats)

moxios.install()
moxios.stubRequest("http://example.org/xml", { headers: {}, responseText: "<x/>" })
moxios.stubRequest("http://example.org/missing", { status: 404 })

describe("Server", () => {

  const requestTests = [

    // Non-API resources
    {
      what: "show HTML on base URL",
      path: "/",
      response(res) {
        expect(res.text).to.match(/<body/)
      },
    },
    {
      what: "show HTML on format page",
      path: "/json",
      response(res) {
        expect(res.text).to.match(/<h2/)
      },
    },
    {
      what: "config-schema.json",
      path: "/config-schema.json",
    },
    {
      what: "format-schema.json",
      path: "/format-schema.json",
    },

    // GET /formats
    {
      what: "list formats at /formats",
      path: "/formats",
      response(res) {
        expect(res.body).to.be.a("array")
        expect(res.body.map(format => format.id).sort()).to.deep.equal([
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
      },
    },
    {
      what: "allow unknown format name at /formats",
      path: "/formats?format=xxxx",
      response: [],
    },
    {
      what: "allow unknown format name at /formats",
      path: "/formats?format=xxxx",
      response: [],
    },

    // GET /types
    {
      what: "list schema languages at /languages",
      path: "/languages",
      response(res) {
        expect(res.body).to.be.a("array")
      },
    },

    // GET /schema
    {
      what: "require a format parameter at /schema",
      path: "/schema",
      code: 400,
      response(res) {
        expect(res.body.message).to.equal("Missing query parameter: format")
      },
    },
    {
      what: "return a schema at /schema",
      path: "/schema?format=json-schema&version=draft-07",
      response: jsonFile("../lib/schemas/json-schema-draft-07.json"),
    },
    {
      what: "return a default schema at /schema",
      path: "/schema?format=digits",
      response(res) {
        expect(res.text).to.equal("^([0-9]+\n)*$")
      },
    },
    {
      what: "return 404 if schema version not found at /schema",
      path: "/schema?format=json-schema&version=notexist",
      error: {
        error: "NotFound",
        message: "Format not found",
        status: 404,
      },
    },
    {
      what: "return 404 if format has no schemas at /schema",
      path: "/schema?format=regexp",
      error: {
        error: "NotFound",
        message: "Format regexp has no schemas",
        status: 404,
      },
    },
    {
      what: "detect invalid format parameter at /schema",
      path: "/schema?format=$",
      error: {
        error: "MalformedRequest",
        message: "Invalid query parameter: format",
        status: 400,
      },
    },
    {
      what: "detect invalid version parameter at /schema",
      path: "/schema?format=json&version=$",
      error: {
        error: "MalformedRequest",
        message: "Invalid query parameter: version",
        status: 400,
      },
    },

    // GET /validate
    {
      what: "require a format parameter at /validate",
      path: "/validate?data=0",
      code: 400,
      response(res) {
        expect(res.body.message).to.equal("Missing query parameter: format")
      },
    },
    {
      what: "require a data or url parameter at /validate",
      path: "/validate?format=json",
      code: 400,
      response(res) {
        expect(res.body.message).to.equal("Please use HTTP POST or provide query parameter 'url' or 'data'")
      },
    },
    {
      what: "return 404 if format not found at /validate",
      path: "/validate?format=notexist&data=x",
      error: {
        error: "NotFound",
        message: "Format not found",
        status: 404,
      },
    },
    {
      what: "return 400 for invalid select",
      path: "/validate?format=json-schema&data=[]&select=_",
      error: {
        error: "MalformedRequest",
        message: "Invalid or unsupported selection (did you mean '$.*' or '$'?)",
        status: 400,
      },
    },
    {
      what: "return 400 for unsupported select",
      path: "/validate?format=json&data=[]&select=$.*",
      error: {
        error: "MalformedRequest",
        message: "Validator does not support selection",
        status: 400,
      },
    },
    {
      what: "validate retrieved from url (valid)",
      path: "/validate?format=xml&url=http://example.org/xml",
      response: [ true ],
    },
    {
      what: "validate retrieved from url (invalid)",
      path: "/validate?format=json&url=http://example.org/xml",
      response: [[{
        message: "Unexpected token < in JSON at position 0",
        position: { linecol: "1:1", rfc5147: "char=0" },
      }]],
    },
    {
      what: "validate retrieved from url (failed to fetch)",
      path: "/validate?format=xml&url=http://example.org/missing",
      error: {
        error: "Error",
        message: "Requesting data from url failed!",
        status: 500,
      },
    },

    // POST /
    {
      what: "require a request body at POST /json",
      path: "/json",
      post: "",
      error: {
        error: "MalformedRequest",
        message: "Missing HTTP POST request body",
        status: 400,
      },
    },
    {
      what: "require a format at POST /",
      path: "/",
      post: "",
      error: {
        error: "MalformedRequest",
        message: "Missing query parameter: format",
        status: 400,
      },
    },
    {
      what: "complain about unknown format at POST /example",
      path: "/example",
      post: "",
      error: {
        error: "NotFound",
        status: 404,
        message: "Format not found",
      },
    },
  ]

  requestTests.forEach(({what, path, code, response, error, post}) => {
    it(`should ${what}`, done => {
      var request = chai.request(app)
      if (post !== undefined) {
        request = request.post(path).send(post)
      } else {
        request = request.get(path)
      }
      request
        .end((err, res) => {
          expect(res.status).to.equal(error ? error.status : code || 200)
          if (error) {
            expect(res.body).to.deep.equal(error)
          } else if (response) {
            if (typeof response === "function") {
              response(res)
            } else {
              expect(res.body).to.deep.equal(response)
            }
          }
          done()
        })
    })
  })

  const validationTests = [
    { format: "json", data: "[]", result: [true] },
    { format: "json", data: "{}", result: [true] },
    {
      format: "json", data: "[false]", result: [true],
      type: "application/json",
    },
    {
      format: "json", data: "null", result: [true],
      type: "application/json",
    },
    {
      format: "json", data: "{",
      result: [[{
        message: "Unexpected end of JSON input",
        position: { rfc5147: "char=1", linecol: "1:2" },
      }]],
    },
    {
      format: "json", data: "{\n1",
      result: [[{
        message: "Unexpected number in JSON at position 2",
        position: { rfc5147: "char=2", linecol: "2:1" },
      }]],
    },
    { format: "json-schema", data: "[]", select: "$.*", result: [] },
    { format: "json-schema", data: "[]", result(r) {
      expect(r[0]).to.be.an("array")
    }},
    { format: "json-schema", data: "{}", result: [true] },
    { format: "json-schema", data: "[{}]", select: "$.*", result: [true] },
    { format: "json-schema", data: "1", select: "$.*", result: [] },
    { format: "json-schema", data: "{\"x\":{}}", select: "$.*", result: [true] },
    {
      format: "json-schema", data: "{\"properties\":0}",
      result: [[{
        message: "must be object",
        position: { jsonpointer: "/properties" },
      }]],
    },
    {
      format: "json-schema@draft-04",
      data: "{\"id\":false}", result: [[{
        message: "must be string",
        position: { jsonpointer: "/id" },
      }]],
    },
    {
      format: "json-schema@draft-07",
      data: "{\"$id\":false}", result: [[{
        message: "must be string",
        position: { jsonpointer: "/$id" },
      }]],
    },
    { format: "array", data: "[]", result: [true] },
    { format: "array", data: "{}", result: [[{
      message: "must be array",
      position: { jsonpointer: "" },
    }]] },
  ]

  validationTests.forEach(({format, data, select, code, type, result}) => {
    const resultCheck = done =>
      ((err, res) => {
        expect(res.status).to.equal(code || 200)
        if (typeof result === "function") {
          result(res.body)
        } else {
          expect(res.body).to.deep.equal(result)
        }
        done()
      })

    select = select || ""
    const niceData = data.replace(/\n/g,"\\n")

    it(`should validate ${format} data ${niceData} ${select} (GET)`, done => {
      chai.request(app)
        .get(`/validate?format=${format}&data=${data}` + (select ? `&select=${select}` : ""))
        .end(resultCheck(done))
    })

    it(`should validate ${format} data ${niceData} ${select} (POST body)`, done => {
      chai.request(app)
        .post(`/${format}` + (select ? `?select=${select}` : ""))
        .set("content-type", type || "application/x-www-form-urlencoded")
        .send(data)
        .end(resultCheck(done))
    })

    it(`should validate ${format} data ${niceData} ${select} (POST multipart)`, done => {
      const fields = { data }
      if (select) fields.select = select
      chai.request(app)
        .post(`/${format}`)
        .type("form")
        .field(fields)
        .end(resultCheck(done))
    })
  })

  it("should complain about version mismatch at POST / (multipart)", done => {
    chai.request(app)
      .post("/json@1")
      .type("form")
      .field({ version: "2" })
      .end((err, res) => {
        expect(res.status).to.equal(400)
        done()
      })
  })

  it("should support file upload validation (1)", done => {
    chai.request(app)
      .post("/json")
      .attach("file", file("../package.json"))
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body).to.deep.equal([true])
        done()
      })
  })

  it("should support file upload validation (2)", done => {
    chai.request(app)
      .post("/json-schema")
      .attach("file", file("../package.json"))
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body[0]).to.be.an("array")
        done()
      })
  })

  it("should support file upload validation with select", done => {
    chai.request(app)
      .post("/jskos")
      .attach("file", file("files/jskos.json"))
      .field("select", "$.*")
      .end((err, res) => {
        expect(res.body).to.deep.equal(jsonFile("files/jskos-errors.json"))
        done()
      })
  })

  it("should validate file retrieved via URL", done => {
    chai.request(app)
      .get("/validate?format=xml&url=http://example.org/xml")
      .end((err, res) => {
        expect(res.body).to.deep.equal([true])
        done()
      })
  })
})

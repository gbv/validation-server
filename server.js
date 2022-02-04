const axios = require("axios")
const config = require("./config")
const { MalformedRequestError } = require("./lib/errors.js")
const ValidatorService = require("./lib/validator.js")

config.log(`Running in ${config.env} mode.`)

// Initialize express with settings
const express = require("express")
const app = express()
app.set("json spaces", 2)
if (config.proxies && config.proxies.length) {
  app.set("trust proxy", config.proxies)
}

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views")
app.set("view engine", "ejs")

// Add default headers
app.use((req, res, next) => {
  if (req.headers.origin) {
    // Allow all origins by returning the request origin in the header
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
  } else {
    // Fallback to * if there is no origin in header
    res.setHeader("Access-Control-Allow-Origin", "*")
  }
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST")
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  next()
})

if (!config.caching) {
  // Disable client side caching
  const nocache = require("nocache")
  app.use(nocache())

  // Disable ETags
  app.set("etag", false)
  app.use(express.urlencoded({ extended: false }))
}

// Root path for static page
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html")
  res.render("base", {
    config,
  })
})

// List of formats
app.get("/formats", require("./routes/formats.js"))

// Setup Validation
var validator

async function validateHandler(req, res, next) {
  validator.validate(req.query)
    .then(result => res.json(result))
    .catch(error => next(error) )
}

// Validation endpoints
app.post("/validate", async (req, res, next) => {
  req.query.data = req.body
  validateHandler(req, res, next)
})

app.get("/validate", async (req, res, next) => {
  const { url } = req.query
  if (url) {
    // TODO: catch error and detect content type
    req.data = (await axios.get(url)).data
  } else if(!req.data) {
    next(new MalformedRequestError("Please use HTTP POST or provide query parameter 'url' or 'data'!"))
    return
  }

  validateHandler(req, res, next)
})

// Error handling
app.use((error, req, res, next) => {  // eslint-disable-line no-unused-vars
  const response = {
    error: error.constructor.name,
    message: error.message,
    status: error.statusCode || 500,
  }
  if (config.env === "development" && error.stack) {
    response.stack = error.stack.split("\n")
  }
  config.log(res)
  res.status(response.status).send(response)
})

// Start service
const start = async () => {
  let port = config.port
  if (config.env == "test") {
    const portfinder = require("portfinder")
    portfinder.basePort = config.port
    port = await portfinder.getPortPromise()
  }

  // Initialize formats registry
  const formats = await require("./lib/formats")(config)
  app.set("formats", formats)
  validator = new ValidatorService(formats)

  app.listen(port, () => {
    config.log(`Now listening on port ${port}`)
  })
}

start()

module.exports = { app }

const config = require("./config")

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
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
  } else {
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
  res.render("base", { config })
})

// Validation endpoint
app.use("/validate", require("./routes/validate.js"))

// List of formats
app.get("/formats", require("./routes/formats.js"))

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
  res.status(response.status).send(response)
})

// Start service
const start = async () => {

  // Find available port on test
  let port = config.port
  if (config.env == "test") {
    const portfinder = require("portfinder")
    portfinder.basePort = config.port
    port = await portfinder.getPortPromise()
  }

  // Initialize formats registry
  const formats = await require("./lib/formats")(config)
  app.set("formats", formats)

  // Let's go!
  app.listen(port, () => {
    config.log(`Now listening on port ${port}`)
  })
}

start()

module.exports = { app }

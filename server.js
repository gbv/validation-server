import express from "express"
import portfinder from "portfinder"

import { loadConfig, createService } from "./index.js"
const config = await loadConfig()

import formatsRoute from "./routes/formats.js"
import validateRoute from "./routes/validate.js"
import schemaRoute from "./routes/schema.js"
import typesRoute from "./routes/types.js"

config.log(`Running in ${config.env} mode.`)

// Initialize express with settings
const app = express()
app.set("json spaces", 2)
if (config.proxies && config.proxies.length) {
  app.set("trust proxy", config.proxies)
}

// Configure view engine to render EJS templates.
app.set("views", "./views")
app.set("view engine", "ejs")

// Middleware to parse the raw body
app.use(
  express.raw({
    limit: config.postLimit,
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || "utf8")
      }
    },
    type: "*/*",
  }),
)

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

// Root path for static page
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html")
  res.render("base", { config })
})

app.use("/validate", validateRoute)
app.get("/formats", formatsRoute)
app.get("/schema", schemaRoute)
app.get("/types", typesRoute)

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
  if (config.env == "test" || config.env === "debug") {
    portfinder.basePort = config.port
    port = await portfinder.getPortPromise()
  }

  // Initialize formats registry
  app.set("validationService", await createService(config))
  app.set("schemaCache", config.cache)

  // Let's go!
  app.listen(port, () => {
    config.log(`Now listening on port ${port}`)
  })
}

start()

export default app

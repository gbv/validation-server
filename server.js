import express from "express"
import portfinder from "portfinder"

import { loadConfig, createService } from "./index.js"

import htmlRoute from "./routes/html.js"
import validateRoute from "./routes/validate.js"
import formatsRoute from "./routes/formats.js"
import languagesRoute from "./routes/languages.js"
import schemaRoute from "./routes/schema.js"
import bytes from "bytes"

const config = loadConfig()
const { logger, limit } = config

logger.info(`Running in ${config.env} mode.`)

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
import typeis from "type-is"
app.use(
  express.raw({
    limit,
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || "utf8")
      }
    },
    type: req => !typeis(req, ["multipart"]),
  }),
)

// Middleware to handle multipart request, including file upload
import multer from "multer"
const fileSize = bytes.parse(limit)
const upload = multer({ limits: { fileSize } })
app.use(upload.single("file"))

// Add default headers
app.use((req, res, next) => {
  if (req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*")
  }
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST")
  next()
})

// Enable routes
app.use("/", htmlRoute)
app.use("/", validateRoute)
app.get("/formats", formatsRoute)
app.get("/languages", languagesRoute)
app.get("/schema", schemaRoute)

// Error handling
app.use((error, req, res, next) => {  // eslint-disable-line no-unused-vars
  const response = {
    error: error.constructor.name,
    message: error.message,
    status: error.statusCode || 500,
  }
  /* c8 ignore next 3 */
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

  config.baseUrl = config.baseUrl || `http://localhost:${port}/`
  app.set("validationConfig", config)

  // Initialize formats registry
  const service = await createService(config)
  app.set("validationService", service)

  // Let's go!
  app.listen(port, () => {
    logger.info(`Now listening on port ${port}`)
  })
}

start()

export default app

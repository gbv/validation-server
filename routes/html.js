import express from "express"
const router = express.Router()

// root page
router.get("/", (req, res) => {
  const service = req.app.get("validationService")
  const baseUrl = req.app.get("baseUrl")
  const formats = service.listFormats()
  res.render("base", { ...service, formats, baseUrl, root: "" })
})

// static files
router.use(express.static("public"))

// format pages
router.get("/:format([0-9a-z_/-]+)", async (req, res, next) => {
  const service = req.app.get("validationService")
  const baseUrl = req.app.get("baseUrl")
  const [ format ] = service.listFormats({ format: req.params.format })
  const formats = service.listFormats()

  if (format) {
    const root = format.id.replace(/[^/]*[/]/g,"../").replace(/[^/]+$/,"")
    res.render("format", { ...service, format, formats, baseUrl, root })
  } else {
    next()
  }
})

export default router

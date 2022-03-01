import express from "express"
const router = express.Router()

// root page
router.get("/", (req, res) => {
  const service = req.app.get("validationService")
  const formats = service.listFormats()
  res.render("base", { ...service, formats })
})

// static files
router.use(express.static("public"))

// format pages
router.get("/:format([0-9a-z_/-]+)", async (req, res, next) => {
  const service = req.app.get("validationService")
  const format = service.getFormat(req.params.format)
  const formats = service.listFormats()

  if (format) {
    res.render("format", { ...service, format, formats })
  } else {
    next()
  }
})

export default router

import express from "express"
const router = express.Router()

import { asArray } from "../lib/utils.js"

function render(req, res, path, vars) {
  const config = req.app.get("validationConfig")
  const service = req.app.get("validationService")
  const formats = service.listFormats()
  res.render(path, { ...service, ...config, formats, ...vars, asArray })
}

// root page
router.get("/", (req, res) => render(req, res, "base", { root: "" }))

// static files
router.use(express.static("public"))

// format pages
router.get("/:format([0-9a-z_/-]+)", async (req, res, next) => {
  const service = req.app.get("validationService")
  const [ format ] = service.listFormats({ format: req.params.format })

  if (format) {
    const root = format.id.replace(/[^/]*[/]/g,"../").replace(/[^/]+$/,"")
    render(req, res, "format", { format, root })
  } else {
    next()
  }
})

export default router

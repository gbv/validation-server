export default function languagesRoute(req, res) {
  const service = req.app.get("validationService")
  res.json(service.listLanguages(req.query))
}

export default function (req, res) {
  const service = req.app.get("validationService")
  res.json(service.listFormats(req.query))
}

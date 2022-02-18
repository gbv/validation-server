export default function typesRoute(req, res) {
  const service = req.app.get("validationService")
  res.json(service.listTypes(req.query))
}

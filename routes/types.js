export default function typesRoute(req, res) {
  const service = req.app.get("formats")
  res.json(service.listTypes(req.query))
}

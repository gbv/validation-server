export default function (req, res) {
  const service = req.app.get("validationService")
  // eslint-disable-next-line no-unused-vars
  res.json(service.listFormats(req.query).map(({parser, ...f}) => f))
}

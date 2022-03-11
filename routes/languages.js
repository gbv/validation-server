export default function languagesRoute(req, res) {
  const service = req.app.get("validationService")
  res.json(service.listLanguages(req.query)
    .map(({validateStream, ...format}) => format)) // eslint-disable-line no-unused-vars
}

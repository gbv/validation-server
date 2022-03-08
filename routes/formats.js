export default function (req, res) {
  const service = req.app.get("validationService")
  res.json(service.listFormats(req.query)
    .map(({validateStream, ...format}) => format)) // eslint-disable-line no-unused-vars
}

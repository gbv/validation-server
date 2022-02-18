export default function (req, res) {
  const formats = req.app.get("formats")
  res.json(formats.listFormats(req.query))
}

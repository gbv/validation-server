module.exports = (req, res) => {
  const formats = req.app.get("formats")
  res.json(formats.formats(req.query))
}

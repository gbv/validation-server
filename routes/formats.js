module.exports = (req, res) => {
  const formats = req.app.get("formats")
  res.json(formats.getFormats(req.query))
}

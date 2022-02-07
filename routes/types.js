const config = require("../config")

module.exports = (req, res) => {
  const { type } = req.query
  res.json(config.types.filter(t => !type || t.id === type))
}

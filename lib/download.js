const axios = require("axios")
const stream = require("stream")
const { promisify } = require("util")
const fs = require("fs")
const path = require("path")

const finished = promisify(stream.finished)

// Download from an URL to a file. Directory is created if missing.
module.exports = async (url, file) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })

  const writer = fs.createWriteStream(file)
  return axios({
    method: "get",
    responseType: "stream",
    url,
  }).then(async response => {
    response.data.pipe(writer)
    return finished(writer)
  })
}

const axios = require("axios")
const fs = require("fs")
const path = require("path")

module.exports = async (url, file, config) => {
  if (config.update === "missing" && fs.existsSync(file)) {
    config.log(`${url} => ${file} (no update)`)
    return file
  } else {
    return axios.get(url, { transformResponse: res => res })
      .then(res => {
        // create directory, if missing
        fs.mkdirSync(path.dirname(file), { recursive: true })
        return fs.promises.writeFile(file, res.data)
      })
      .then(() => {
        config.log(`${url} => ${file}`)
        return file
      })
      .catch(error => {
        config.warn(`${url} => ${file} (FAILED)`)
        throw error
      })
  }
}

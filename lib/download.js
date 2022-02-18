import axios from "axios"
import fs from "fs"
import path from "path"

export default async function download(url, file, config) {
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

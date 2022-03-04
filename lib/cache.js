import fs from "fs"
import cacache from "cacache"
import fetch from "node-fetch"
import tmp from "tmp"
tmp.setGracefulCleanup()

// Simple file-system cache for resources fetched via HTTP
class Cache {

  constructor(path) {
    this.path = path ?? tmp.dirSync().name
    if (!fs.existsSync(this.path)) {
      if (!fs.mkdirSync(this.path, { recursive: true })) {
        throw new Error(`Failed to create cache at ${this.path}`)
      }
    }
  }

  async get(key) {
    return cacache.get.info(this.path, key) // => { key, path, metadata, ... } or null
  }

  async put(key, data, metadata={}) {
    return cacache.put(this.path, key, data, { metadata })
  }

  async keys() {
    return cacache.ls(this.path).then(index => Object.keys(index))
  }

  async fetch(url, options={}) {
    const log = options.log || (() => {})
    const headers = options.headers || {}
    const agent = options.agent
    const rememberHeaders = ["content-type","last-modified"]
    const cache = this

    return cache.get(url)
      .then(r => {
        if (r) return r
        log(`Downloading ${url}`)
        return fetch(url, { headers, agent })
          .then(async res => {
            if (!res.ok) throw new Error()
            const headers = {}
            for (let key of rememberHeaders) {
              const value = res.headers.get(key)
              if (value) headers[key] = value
            }
            const content = await res.text()
            return cache.put(url, content, { headers })
              .then(() => cache.get(url))
          })
          .catch(() => {
            throw new Error(`Failed to download ${url}`)
          })
      })
  }
}

export default Cache

import fs from "fs"
import path from "path"
import { ValidationError } from "./errors.js"

export const ndjson = {
  parseSync (data) {
    const lines = data.split("\n")
    for (let i=0; i<lines.length; i++) {
      try {
        lines[i] = JSON.parse(lines[i])
      } catch(e) {
        throw new ValidationError(`Line ${i} is no valid JSON`)
      }
    }
    return lines
  },
}

// TODO: support yaml as well

export function readSync (file, dir) {
  if (dir) {
    file = path.resolve(dir, file)
  }
  if (file.match(/\.ndjson$/)) {
    return ndjson.parseSync(fs.readFileSync(file))
  } else {
    return JSON.parse(fs.readFileSync(file))
  }
}

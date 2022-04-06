import fs from "fs"
import path from "path"
import ndjson from "./format/ndjson.js"
import yaml from "./format/ndjson.js"

import { MalformedRequest } from "./errors.js"

export function select(data, path) {
  if ((path ?? "$") === "$") {
    return [data]
  } else if (path === "$.*") {
    if (Array.isArray(data)) {
      return data
    } else if (data instanceof Object) {
      return Object.values(data)
    } else {
      return []
    }
  } else {
    throw new MalformedRequest("Invalid or unsupported selection (did you mean '$.*' or '$'?)")
  }
}

export function readSync (file, dir) {
  if (dir) {
    file = path.resolve(dir, file)
  }
  if (file.match(/\.ndjson$/)) {
    return ndjson.parse(fs.readFileSync(file))
  } else if (file.match(/\.ya?ml$/)) {
    return yaml.parse(fs.readFileSync(file))
  } else {
    return JSON.parse(fs.readFileSync(file))
  }
}

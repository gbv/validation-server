import { MalformedRequest } from "./api-error.js"

export const asArray = x => Array.isArray(x) ? x : [x]

export const addToArray = (obj, key, value) => {
  if (key in obj) {
    obj[key] = asArray(obj[key])
    obj[key].push(value)
  } else {
    obj[key] = [value]
  }
}

export const disallowSelect = (options, name) => {
  if (options && (options.select || options.select === "0")) {
    throw new MalformedRequest(`${name} validator does not support selection`)
  }
}

export const unbuffer = data => data instanceof Buffer ? data.toString() : data
